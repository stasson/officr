import mockStdin from 'mock-stdin'

const stdin = mockStdin.stdin()

function send(...args: string[]) {
  function sendAnswer() {
    setTimeout(() => {
      const text = args.shift()
      if (text) {
        stdin.send(text)
        sendAnswer()
      }
    }, 0)
  }
  sendAnswer()
}

export default {
  send,
  end: stdin.end,
  reset: stdin.reset
}
