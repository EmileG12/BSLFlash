// Shared by hooks that scan a Bash command string for trigger words with a plain regex
// heuristic (not a shell parser). Strips text that isn't actually executed as a command --
// single/double-quoted string contents and heredoc bodies -- so a trigger word merely
// *mentioned* inside a quoted argument (a commit message, a doc edit passed via `-m` or a
// heredoc) doesn't false-positive the same way a real invocation of that command would.
//
// Deliberately bounded, matching the "catch the ordinary case" philosophy already used by
// every hook that imports this: handles the single/double-quoted heredoc and quoting shapes
// that show up in ordinary commit-message/doc-editing commands, not every shell quoting form
// (nested heredocs, $'...' ANSI-C quoting, and escaped quotes inside quotes are unhandled).
//
// Known residual gap: callers that split a command into ;/&&/|| segments before calling this
// do so on the *raw* command, so a heredoc body containing literal ";"/"&&"/"||" as prose text
// can still split mid-heredoc. Rare enough (meta-prose about shell syntax inside a commit
// message) to accept rather than reorder every caller's segment splitting around this.

function stripHeredocs(command) {
  const HEREDOC_START = /<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/
  let result = ''
  let i = 0

  while (i < command.length) {
    const rest = command.slice(i)
    const match = HEREDOC_START.exec(rest)
    if (!match) {
      result += rest
      break
    }

    const newlineAfterStart = command.indexOf('\n', i + match.index + match[0].length)
    if (newlineAfterStart === -1) {
      result += rest
      break
    }

    result += command.slice(i, newlineAfterStart + 1)

    const tag = match[2]
    const allowIndent = match[0].startsWith('<<-')
    const terminator = new RegExp(`^${allowIndent ? '[ \\t]*' : ''}${tag}\\s*$`, 'm')
    const body = command.slice(newlineAfterStart + 1)
    const terminatorMatch = terminator.exec(body)

    i = terminatorMatch
      ? newlineAfterStart + 1 + terminatorMatch.index + terminatorMatch[0].length
      : command.length
  }

  return result
}

function stripQuotedSpans(command) {
  return command.replace(/"(?:[^"\\]|\\.)*"/g, '""').replace(/'[^']*'/g, "''")
}

export function stripQuoted(command) {
  return stripQuotedSpans(stripHeredocs(command))
}
