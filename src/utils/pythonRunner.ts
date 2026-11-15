export interface PythonRunResult {
  success: boolean;
  output: string;
  linesCount: number;
  error?: string;
}

/**
 * Deterministic in-browser Python Nested-Loops Runner supporting:
 * - Variable assignments: a = 4, sumGrades = 0, a = a + 3
 * - for <var> in range(stop) | range(start, stop) | range(start, stop, step)
 * - while <var> <= <num> | < | >= | > | == | !=
 * - print(..., end=" ") and print()
 * - Strict Python indentation checking & infinite-loop safety guard
 */
export function runNestedLoopPython(code: string): PythonRunResult {
  const rawLines = code.split('\n');

  interface ParsedLine {
    lineNum: number;
    indent: number;
    text: string;
  }

  const parsed: ParsedLine[] = [];
  for (let idx = 0; idx < rawLines.length; idx++) {
    const raw = rawLines[idx];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const expanded = raw.replace(/\t/g, '    ');
    const indentMatch = expanded.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    parsed.push({ lineNum: idx + 1, indent, text: trimmed });
  }

  if (parsed.length === 0) {
    return {
      success: false,
      output: '',
      linesCount: 0,
      error: 'المحرر فارغ! اكتبي مقطعاً برمجياً بلغة بايثون ثم اضغطي تشغيل.',
    };
  }

  const vars: Record<string, number> = {};
  const outputBuffer: string[] = [''];
  let safetyCounter = 0;
  const MAX_STEPS = 800;

  function evalExpr(expr: string): number {
    const clean = expr.trim();
    if (/^-?\d+$/.test(clean)) return parseInt(clean, 10);
    // Replace variable names safely
    const replaced = clean.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (token) => {
      if (token in vars) return String(vars[token]);
      throw new Error(`المتغير "${token}" غير معرّف قبل استخدامه.`);
    });
    if (!/^[-+*/%()\d\s]+$/.test(replaced)) {
      throw new Error(`تعبير غير مدعوم: ${clean}`);
    }
    // Safe arithmetic evaluation
    const fn = new Function(`return (${replaced});`);
    const val = fn();
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw new Error(`تعذر حساب التعبير: ${clean}`);
    }
    return Math.trunc(val);
  }

  function evalCondition(cond: string): boolean {
    const match = cond.match(/^(.+?)(<=|>=|==|!=|<|>)(.+)$/);
    if (!match) throw new Error(`شرط while غير مفهوم: ${cond}`);
    const left = evalExpr(match[1]);
    const op = match[2];
    const right = evalExpr(match[3]);
    switch (op) {
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '<': return left < right;
      case '>': return left > right;
      case '==': return left === right;
      case '!=': return left !== right;
      default: return false;
    }
  }

  function parseRangeArgs(argsStr: string): number[] {
    const parts = argsStr.split(',').map((p) => evalExpr(p));
    let start = 0;
    let stop = 0;
    let step = 1;
    if (parts.length === 1) {
      stop = parts[0];
    } else if (parts.length === 2) {
      start = parts[0];
      stop = parts[1];
    } else if (parts.length === 3) {
      start = parts[0];
      stop = parts[1];
      step = parts[2];
    } else {
      throw new Error('دالة range تقبل ١ أو ٢ أو ٣ معاملات فقط.');
    }
    if (step === 0) throw new Error('قيمة الخطوة (step) في range لا يمكن أن تساوي صفراً.');
    const result: number[] = [];
    if (step > 0) {
      for (let v = start; v < stop; v += step) {
        result.push(v);
        if (result.length > 200) break;
      }
    } else {
      for (let v = start; v > stop; v += step) {
        result.push(v);
        if (result.length > 200) break;
      }
    }
    return result;
  }

  function splitPrintArgs(inner: string): string[] {
    const args: string[] = [];
    let current = '';
    let inQuote: string | null = null;
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if ((ch === '"' || ch === "'") && inner[i - 1] !== '\\') {
        if (inQuote === ch) inQuote = null;
        else if (!inQuote) inQuote = ch;
        current += ch;
      } else if (ch === ',' && !inQuote) {
        args.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) args.push(current.trim());
    return args;
  }

  function executePrint(stmt: string) {
    const innerMatch = stmt.match(/^print\s*\((.*)\)$/);
    if (!innerMatch) throw new Error(`صيغة print غير صحيحة: ${stmt}`);
    const inner = innerMatch[1].trim();
    if (!inner) {
      outputBuffer.push('');
      return;
    }

    const args = splitPrintArgs(inner);
    let endStr = '\n';
    const printableParts: string[] = [];

    for (const arg of args) {
      const endMatch = arg.match(/^end\s*=\s*(["'])(.*)\1$/);
      if (endMatch) {
        endStr = endMatch[2];
        continue;
      }
      const strMatch = arg.match(/^(["'])(.*)\1$/);
      if (strMatch) {
        printableParts.push(strMatch[2]);
      } else {
        printableParts.push(String(evalExpr(arg)));
      }
    }

    const text = printableParts.join(' ');
    outputBuffer[outputBuffer.length - 1] += text;
    if (endStr === '\n') {
      outputBuffer.push('');
    } else {
      outputBuffer[outputBuffer.length - 1] += endStr;
    }
  }

  function executeBlock(startIdx: number, expectedIndent: number): number {
    let i = startIdx;
    while (i < parsed.length) {
      const line = parsed[i];
      if (line.indent < expectedIndent) {
        return i;
      }
      if (line.indent > expectedIndent) {
        throw new Error(`خطأ في المسافة البادئة (IndentationError) في السطر ${line.lineNum}: "${line.text}"`);
      }

      safetyCounter++;
      if (safetyCounter > MAX_STEPS) {
        throw new Error('تم إيقاف التنفيذ تلقائياً لتجاوز الحد الأقصى للتكرارات (احتمال حلقة لا نهائية).');
      }

      // Check for loop
      const forMatch = line.text.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+range\s*\((.+)\)\s*:$/);
      const whileMatch = line.text.match(/^while\s+(.+)\s*:$/);

      if (forMatch) {
        const varName = forMatch[1];
        const values = parseRangeArgs(forMatch[2]);
        const bodyStart = i + 1;
        if (bodyStart >= parsed.length || parsed[bodyStart].indent <= line.indent) {
          throw new Error(`توقعنا مسافة بادئة داخل حلقة for في السطر ${line.lineNum}.`);
        }
        const bodyIndent = parsed[bodyStart].indent;
        let nextAfterBlock = bodyStart;

        // Determine block end even if range is empty
        let scan = bodyStart;
        while (scan < parsed.length && parsed[scan].indent >= bodyIndent) {
          scan++;
        }
        nextAfterBlock = scan;

        for (const val of values) {
          vars[varName] = val;
          executeBlock(bodyStart, bodyIndent);
        }
        i = nextAfterBlock;
        continue;
      }

      if (whileMatch) {
        const condExpr = whileMatch[1];
        const bodyStart = i + 1;
        if (bodyStart >= parsed.length || parsed[bodyStart].indent <= line.indent) {
          throw new Error(`توقعنا مسافة بادئة داخل حلقة while في السطر ${line.lineNum}.`);
        }
        const bodyIndent = parsed[bodyStart].indent;
        let scan = bodyStart;
        while (scan < parsed.length && parsed[scan].indent >= bodyIndent) {
          scan++;
        }
        const nextAfterBlock = scan;

        let guard = 0;
        while (evalCondition(condExpr)) {
          guard++;
          if (guard > 150) {
            throw new Error(`حلقة while تجاوزت ١٥٠ دورة في السطر ${line.lineNum}. تأكدي من تحديث المتغير.`);
          }
          executeBlock(bodyStart, bodyIndent);
        }
        i = nextAfterBlock;
        continue;
      }

      if (line.text.startsWith('print')) {
        executePrint(line.text);
        i++;
        continue;
      }

      // Assignment: var = expr
      const assignMatch = line.text.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch) {
        vars[assignMatch[1]] = evalExpr(assignMatch[2]);
        i++;
        continue;
      }

      throw new Error(`أمر غير مدعوم في السطر ${line.lineNum}: "${line.text}"`);
    }
    return i;
  }

  try {
    if (parsed[0].indent !== 0) {
      throw new Error(`السطر الأول يجب أن يبدأ بدون مسافة بادئة (السطر ${parsed[0].lineNum}).`);
    }
    executeBlock(0, 0);
    // Trim trailing empty newline
    if (outputBuffer.length > 1 && outputBuffer[outputBuffer.length - 1] === '') {
      outputBuffer.pop();
    }
    const finalOutput = outputBuffer.join('\n');
    return {
      success: true,
      output: finalOutput,
      linesCount: outputBuffer.filter((l) => l.length > 0).length,
    };
  } catch (err: any) {
    return {
      success: false,
      output: outputBuffer.join('\n'),
      linesCount: 0,
      error: err.message || 'حدث خطأ أثناء تشغيل الكود.',
    };
  }
}
