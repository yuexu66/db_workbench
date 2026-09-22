import axios from 'axios'

// 内置励志语录库
const localQuotes = [
  '努力的意义，是为了遇见更好的自己。',
  '星光不问赶路人，时光不负有心人。',
  '你所热爱的，就是你的生活。',
  '慢慢来，谁还没有一个努力的过程。',
  '生活原本沉闷，但跑起来就有风。',
  '愿你以渺小启程，以伟大结束。',
  '今天的努力，是幸运的伏笔。',
  '不要因为走得太远，而忘记为什么出发。',
  '所有的惊艳，都来自长久的努力。',
  '你要悄悄拔尖，然后惊艳所有人。',
  '熬过无人问津的日子，才有诗和远方。',
  '不是每一次努力都有收获，但每一次收获都必须努力。',
  '世界上最快乐的事，莫过于为理想而奋斗。',
  '只有不断寻找机会的人，才会及时把握机会。',
  '做自己生命中的主角，而不是别人生命中的看客。',
  '人生没有白走的路，每一步都算数。',
  '愿你成为自己的太阳，无需凭借谁的光。',
  '别让平淡的生活，耗尽你所有的向往。',
  '你现在的努力，是在为未来铺路。',
  '保持热爱，奔赴山海。',
  '前路浩浩荡荡，万事尽可期待。',
  '以梦为马，不负韶华。',
  '心之所向，素履以往。',
  '凡心所向，素履所往，生如逆旅，一苇以航。',
  '不要慌，太阳下山有月光，月光落下有朝阳。',
  '种一棵树最好的时间是十年前，其次是现在。',
  '你要忍，忍到春暖花开；你要走，走到灯火通明。',
  '生活不会辜负每一个努力的人。',
  '你的坚持，终将美好。',
  '愿你走出半生，归来仍是少年。',
  '但行好事，莫问前程。',
  '脚踏实地，仰望星空。',
  '念念不忘，必有回响。',
  '千里之行，始于足下。',
  '不积跬步，无以至千里；不积小流，无以成江海。',
  '业精于勤，荒于嬉；行成于思，毁于随。',
  '宝剑锋从磨砺出，梅花香自苦寒来。',
  '路漫漫其修远兮，吾将上下而求索。',
  '天行健，君子以自强不息。',
  '地势坤，君子以厚德载物。',
  '非淡泊无以明志，非宁静无以致远。',
  '会当凌绝顶，一览众山小。',
  '长风破浪会有时，直挂云帆济沧海。',
  '天生我材必有用，千金散尽还复来。',
  '莫愁前路无知己，天下谁人不识君。',
  '海内存知己，天涯若比邻。',
  '欲穷千里目，更上一层楼。'
]

export function getRandomQuote() {
  return localQuotes[Math.floor(Math.random() * localQuotes.length)]
}

export function getDailyQuote() {
  const today = new Date().toDateString()
  const saved = localStorage.getItem('pw_daily_quote')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.date === today) return parsed.quote
    } catch {}
  }
  const quote = getRandomQuote()
  localStorage.setItem('pw_daily_quote', JSON.stringify({ date: today, quote }))
  return quote
}

// 尝试从一言API获取，失败则用本地
export async function fetchQuoteFromApi() {
  try {
    const res = await axios.get('https://v1.hitokoto.cn', { timeout: 3000 })
    if (res.data && res.data.hitokoto) {
      return res.data.hitokoto
    }
  } catch {
    // 静默失败
  }
  return getRandomQuote()
}
