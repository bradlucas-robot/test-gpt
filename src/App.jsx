import { useEffect, useMemo, useState } from 'react'
import { aiPrompts, astronomyCards, missions, quizQuestions } from './data'

function StatCard({ label, value, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-subtext">{subtext}</div>
    </div>
  )
}

function KnowledgeCard({ item }) {
  return (
    <div className="knowledge-card">
      <div className="knowledge-emoji">{item.emoji}</div>
      <h3>{item.title}</h3>
      <p>{item.fact}</p>
      <span>{item.tip}</span>
    </div>
  )
}

function MissionPanel({ mission, unlocked, completed, onComplete }) {
  const [phase, setPhase] = useState('idle')
  const [countdown, setCountdown] = useState(3)
  const [message, setMessage] = useState('准备执行任务')

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) {
      setMessage('现在，点火起飞！')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, countdown])

  const startMission = () => {
    setPhase('countdown')
    setCountdown(3)
    setMessage('倒计时开始，准备好！')
  }

  const launch = () => {
    if (countdown === 0 && phase === 'countdown') {
      setMessage('发射成功！你完成了一次完美起飞。')
      setPhase('done')
      onComplete(mission.id)
    } else {
      setMessage('太早了，再观察一下倒计时！')
    }
  }

  return (
    <div className={`mission-card ${!unlocked ? 'locked' : ''}`}>
      <div className="mission-header">
        <div>
          <h3>{mission.title}</h3>
          <p>{mission.description}</p>
        </div>
        <span className={`badge ${completed ? 'done' : unlocked ? 'open' : 'locked'}`}>
          {completed ? '已完成' : unlocked ? '进行中' : '未解锁'}
        </span>
      </div>
      <div className="mission-body">
        <p><strong>挑战：</strong>{mission.challenge}</p>
        <p><strong>知识点：</strong>{mission.knowledge}</p>
        {mission.id === 1 ? (
          <div className="launch-box">
            <div className="countdown-display">{phase === 'countdown' ? (countdown === 0 ? 'GO!' : countdown) : 'READY'}</div>
            <div className="launch-actions">
              <button disabled={!unlocked || completed} onClick={startMission}>开始倒计时</button>
              <button disabled={!unlocked || completed} className="primary" onClick={launch}>点火起飞</button>
            </div>
            <p className="mission-message">{message}</p>
          </div>
        ) : (
          <div className="mini-placeholder">
            <p>该任务模块已预留为下一阶段扩展内容。</p>
            <button disabled={!unlocked || completed} className="primary" onClick={() => onComplete(mission.id)}>
              模拟完成任务
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function QuizPanel({ onPass }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [finished, setFinished] = useState(false)

  const current = quizQuestions[index]

  const submit = () => {
    if (!selected) return
    const correct = selected === current.answer
    const nextScore = correct ? score + 1 : score
    setScore(nextScore)
    setFeedback(`${correct ? '回答正确！' : '这次答错了。'} ${current.explanation}`)

    setTimeout(() => {
      if (index === quizQuestions.length - 1) {
        setFinished(true)
        if (nextScore >= 2) onPass(nextScore)
      } else {
        setIndex((i) => i + 1)
        setSelected('')
        setFeedback('')
      }
    }, 1400)
  }

  if (finished) {
    return (
      <div className="quiz-card">
        <h3>知识挑战完成</h3>
        <p>你的得分：{score} / {quizQuestions.length}</p>
        <p>{score >= 2 ? '太棒了，你已经具备初级太空知识！' : '再试一次，你会越来越厉害。'}</p>
      </div>
    )
  }

  return (
    <div className="quiz-card">
      <div className="quiz-progress">第 {index + 1} 题 / {quizQuestions.length}</div>
      <h3>{current.question}</h3>
      <div className="quiz-options">
        {current.options.map((option) => (
          <button
            key={option}
            className={selected === option ? 'selected' : ''}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <button className="primary" onClick={submit}>提交答案</button>
      {feedback && <p className="quiz-feedback">{feedback}</p>}
    </div>
  )
}

function AIConsole({ onUnlock }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: aiPrompts.greeting },
  ])
  const [input, setInput] = useState('')

  const askAI = () => {
    if (!input.trim()) return
    const text = input.trim()
    let reply = aiPrompts.default
    const lower = text.toLowerCase()

    if (text.includes('梦想') || text.includes('宇航员')) reply = aiPrompts.dream
    else if (text.includes('火星')) reply = aiPrompts.mars
    else if (text.includes('星星') || text.includes('恒星')) reply = aiPrompts.stars

    const next = [
      ...messages,
      { role: 'user', text },
      { role: 'ai', text: reply },
    ]
    setMessages(next)
    setInput('')
    if (next.length >= 5) onUnlock()
  }

  return (
    <div className="ai-console">
      <div className="ai-console-header">
        <h3>AI 航天伙伴 · 星航</h3>
        <span>儿童友好对话模式</span>
      </div>
      <div className="chat-list">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-item ${msg.role}`}>
            <span>{msg.role === 'ai' ? 'AI' : '你'}</span>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="比如：火星为什么是红色的？"
        />
        <button className="primary" onClick={askAI}>发送</button>
      </div>
    </div>
  )
}

export default function App() {
  const [knowledgePassed, setKnowledgePassed] = useState(false)
  const [aiUnlocked, setAiUnlocked] = useState(false)
  const [completedMissions, setCompletedMissions] = useState([])

  const totalPoints = useMemo(() => {
    return (knowledgePassed ? 30 : 0) + (aiUnlocked ? 20 : 0) + completedMissions.length * 25
  }, [knowledgePassed, aiUnlocked, completedMissions])

  const title = useMemo(() => {
    if (totalPoints >= 90) return '星际见习宇航员'
    if (totalPoints >= 50) return '太空探索少年'
    return '梦想启航学员'
  }, [totalPoints])

  const handleMissionComplete = (id) => {
    setCompletedMissions((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <div className="app-shell">
      <header className="hero-section">
        <div className="hero-copy">
          <div className="pill">Astronaut Dream × AI Learning</div>
          <h1>星际小宇航员 AI 学园</h1>
          <p>
            一个为有宇航员梦想的小学生设计的互动前端：把天文知识、任务闯关、AI 对话和成长激励结合在一起，
            让“想上太空”变成可体验、可学习、可持续扩展的数字旅程。
          </p>
          <div className="hero-actions">
            <a href="#knowledge" className="primary-link">开始学习</a>
            <a href="#missions" className="secondary-link">进入任务舱</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="planet planet-1"></div>
          <div className="planet planet-2"></div>
          <div className="rocket">🚀</div>
          <div className="orbit-card">
            <div>当前身份</div>
            <strong>{title}</strong>
            <span>已累计 {totalPoints} 成长积分</span>
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard label="知识解锁" value={knowledgePassed ? '已通过' : '待挑战'} subtext="完成基础天文问答" />
        <StatCard label="AI 互动" value={aiUnlocked ? '已激活' : '未充分互动'} subtext="和 AI 星航连续交流" />
        <StatCard label="任务进度" value={`${completedMissions.length}/${missions.length}`} subtext="逐步成为太空探索者" />
      </section>

      <section id="knowledge" className="section-block">
        <div className="section-title">
          <h2>第一站：认识宇宙</h2>
          <p>先从孩子最容易理解、最能激发好奇心的知识点切入，建立“看见宇宙 → 理解宇宙 → 想探索宇宙”的兴趣链路。</p>
        </div>
        <div className="knowledge-grid">
          {astronomyCards.map((item) => <KnowledgeCard key={item.title} item={item} />)}
        </div>
      </section>

      <section className="section-block split-layout">
        <div>
          <div className="section-title left">
            <h2>第二站：知识挑战</h2>
            <p>用低门槛选择题建立成就感，并为后续任务舱解锁做准备。</p>
          </div>
          <QuizPanel onPass={() => setKnowledgePassed(true)} />
        </div>
        <div>
          <div className="section-title left">
            <h2>第三站：AI 航天伙伴</h2>
            <p>不是冷冰冰的问答框，而是一个会鼓励、会科普、会激发梦想的儿童友好 AI 角色。</p>
          </div>
          <AIConsole onUnlock={() => setAiUnlocked(true)} />
        </div>
      </section>

      <section id="missions" className="section-block">
        <div className="section-title">
          <h2>第四站：任务训练舱</h2>
          <p>把抽象的宇航员训练拆解成可以逐步完成的小游戏模块，后面可以继续扩充记忆、判断、资源规划、协作任务。</p>
        </div>
        <div className="mission-stack">
          {missions.map((mission, idx) => {
            const unlocked = idx === 0 || knowledgePassed || aiUnlocked || completedMissions.includes(mission.id - 1)
            return (
              <MissionPanel
                key={mission.id}
                mission={mission}
                unlocked={unlocked}
                completed={completedMissions.includes(mission.id)}
                onComplete={handleMissionComplete}
              />
            )
          })}
        </div>
      </section>

      <section className="section-block roadmap-section">
        <div className="section-title">
          <h2>产品化思路</h2>
          <p>这个前端不只是一个页面，而是一个可持续扩展的儿童航天教育产品原型。</p>
        </div>
        <div className="roadmap-grid">
          <div className="roadmap-card">
            <h3>1. 角色化体验</h3>
            <p>用“小宇航员成长档案”代替普通用户系统，让孩子在身份认同中坚持学习。</p>
          </div>
          <div className="roadmap-card">
            <h3>2. 模块化内容</h3>
            <p>知识卡片、问答、AI 对话、任务系统已拆分为独立组件，方便继续增加新玩法。</p>
          </div>
          <div className="roadmap-card">
            <h3>3. AI 可升级</h3>
            <p>当前是前端模拟 AI，后续可以无缝接入真正的大模型接口，实现个性化科普与学习陪伴。</p>
          </div>
          <div className="roadmap-card">
            <h3>4. 学校/家庭场景</h3>
            <p>可延展为课堂展示、家庭陪学、科学营活动入口，形成寓教于乐的数字产品。</p>
          </div>
        </div>
      </section>
    </div>
  )
}
