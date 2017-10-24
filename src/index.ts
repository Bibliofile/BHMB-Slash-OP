import { MessageBot } from '@bhmb/bot'
import { UIExtensionExports } from '@bhmb/ui'

interface Message {
  name: string
  message: string
  timestamp: number
}

import html from './tab.html'

MessageBot.registerExtension('bibliofile/slash_op', (ex, world) => {
  const getMessages = () => ex.storage.get<Message[]>('messages', [])

  const addMessage = (name: string, message: string) => {
    ex.storage.set('messages', [...getMessages(), {name, message, timestamp: Date.now()}])
  }

  world.addCommand('op', (player, message) => {
    addMessage(player.name, message)
  })

  ex.remove = () => world.removeCommand('op')

  // Browser only
  const ui = ex.bot.getExports('ui') as UIExtensionExports
  if (!ui) return

  var tab = ui.addTab('OP Log')
  tab.innerHTML = html

  const input = tab.querySelector('input') as HTMLInputElement
  const children = (tab.querySelector('#op_msgs') as HTMLElement).children


  input.addEventListener('keyup', () => {
    let search = input.value.toLocaleUpperCase()
    Array.from(children).forEach((child: HTMLElement) => {
      if ((child.dataset.search as string).includes(search)) {
        child.classList.remove('hidden')
      } else {
        child.classList.add('hidden')
      }
    })
  })

  tab.addEventListener('click', function (e) {
    const target = e.target as HTMLElement
    if (target.classList.contains('dismiss')) {
      (target.parentElement as HTMLElement).remove()

      let messages: Message[] = []
      Array.from(children).forEach((child: HTMLElement) => {
        messages.push({
          name: child.dataset.name as string,
          message: child.dataset.message as string,
          timestamp: +(child.dataset.timestamp as string),
        })
      })

      ex.storage.set('messages', messages)
    }
  })

  function addToPage(msg: Message) {
    let time = new Date(+msg.timestamp)
    let timeStr = time.toLocaleDateString() + ', ' + time.toLocaleTimeString()
    ui.buildTemplate(tab.querySelector('template') as any, '#op_msgs', [
      { selector: 'div',
        'data-name': msg.name,
        'data-message': msg.message,
        'data-timestamp': msg.timestamp,
        'data-search': msg.name + ': ' + msg.message.toLocaleUpperCase()
      },
      { selector: '.name', text: msg.name },
      { selector: '.msg', text: msg.message },
      { selector: '.time', text: timeStr },
    ])
  }
  getMessages().forEach(addToPage)

  world.removeCommand('op')
  world.addCommand('op', (player, message) => {
    addMessage(player.name, message)
    addToPage({ name: player.name, message, timestamp: Date.now() })
  })

  ex.remove = () => {
    world.removeCommand('op')
    ui.removeTab(tab)
  }
})
