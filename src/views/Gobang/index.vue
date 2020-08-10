<template>
  <div class="flag">轮走方:{{ flag ? '黑子' : '白子' }}</div>
  <canvas
    class="canvas"
    ref="canvas"
    width="375"
    height="375"
    @click="handleClick"
  >
    麻烦做个人。
  </canvas>
  <div class="button">
    <button @click="regretChess">悔棋</button>
    <button @click="pass">PASS</button>
  </div>
</template>

<script>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import io from 'socket.io-client'
import {useRoute} from 'vue-router'

export default {
  name: 'Gobang',
  setup() {
    const canvas = ref(null)
    const step = ref([])
    const socket = ref(null)
    const BLANK = 25 // 间隔
    const RADIUS = 10 // 棋子半径
    const BORDER = 15 // 边框距离
    const LENGTH = BLANK * 14 + BORDER // 棋盘长度
    let ctx
    let flag = computed(() => {
      return step.value.length % 2 === 0
    })
    const route = useRoute()
    const room = computed(() => {
      return route.params.room
    })
    let regretNumber = 0

    onMounted(() => {
      if (canvas.value.getContext) {
        ctx = canvas.value.getContext('2d')
        initBlock()
      }

      socket.value = io('http://localhost:3000/gobang')
      socket.value.emit('join', room.value)

      socket.value.on('system', message => {
        console.log(message)
      })
    })

    onBeforeUnmount(() => {
      socket.value.emit('leave', room.value)
    })

    function initBlock() {
      for (let i = 0; i < 15; i++) {
        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.moveTo(BORDER, BLANK * i + BORDER)
        ctx.lineTo(LENGTH, BLANK * i + BORDER)
        ctx.moveTo(BLANK * i + BORDER, BORDER)
        ctx.lineTo(BLANK * i + BORDER, LENGTH)
        ctx.stroke()
      }
    }

    function drawPiece(x, y) {
      ctx.beginPath()
      ctx.arc(BLANK * x + BORDER, BLANK * y + BORDER, RADIUS, 0, 2 * Math.PI)
      ctx.fillStyle = flag.value ? 'black' : 'white'
      ctx.fill()
    }

    function handleClick({ offsetX, offsetY }) {
      offsetX -= BORDER
      offsetY -= BORDER
      const x = Math.round(offsetX / BLANK)
      const y = Math.round(offsetY / BLANK)
      if (step.value.includes(`${x},${y}`)) {
        return alert('该位置已落子')
      }
      drawPiece(x, y)
      step.value.push(`${x},${y}`)
      regretNumber = 0
    }

    function regretChess() {
      if (step.value.length === 0) {
        return alert('无子可悔')
      }
      if (regretNumber === 1) {
        return alert('已悔过一次')
      }
      regretNumber = 1
      const result = step.value.pop()
      if (result === null) {
        return
      }
      const [x, y] = result.split(',')
      drawLine(Number(x), Number(y))
    }

    function drawLine(x, y) {
      // 清除棋子
      ctx.clearRect(
        Math.round(x * BLANK - RADIUS + BORDER),
        Math.round(y * BLANK - RADIUS + BORDER),
        2 * RADIUS,
        2 * RADIUS,
      )

      ctx.beginPath()
      // 画横线
      if (x === 0) {
        ctx.moveTo(x * BLANK + BORDER, Math.round(y * BLANK + BORDER))
        ctx.lineTo(x * BLANK + RADIUS + BORDER, Math.round(y * BLANK + BORDER))
      } else if (x === 14) {
        ctx.moveTo(x * BLANK - RADIUS + BORDER, Math.round(y * BLANK + BORDER))
        ctx.lineTo(x * BLANK + BORDER, Math.round(y * BLANK + BORDER))
      } else {
        ctx.moveTo(x * BLANK - RADIUS + BORDER, Math.round(y * BLANK + BORDER))
        ctx.lineTo(x * BLANK + RADIUS + BORDER, Math.round(y * BLANK + BORDER))
      }

      // 画竖线
      if (y === 0) {
        ctx.moveTo(x * BLANK + BORDER, Math.round(y * BLANK + BORDER))
        ctx.lineTo(x * BLANK + BORDER, Math.round(y * BLANK + RADIUS + BORDER))
      } else if (y === 14) {
        ctx.moveTo(x * BLANK + BORDER, Math.round(y * BLANK - RADIUS + BORDER))
        ctx.lineTo(x * BLANK + BORDER, Math.round(y * BLANK + BORDER))
      } else {
        ctx.moveTo(x * BLANK + BORDER, Math.round(y * BLANK - RADIUS + BORDER))
        ctx.lineTo(x * BLANK + BORDER, Math.round(y * BLANK + RADIUS + BORDER))
      }
      ctx.stroke()
    }

    function pass() {
      step.value.push(null)
      regretNumber = 0
    }

    return {
      canvas,
      step,
      flag,
      handleClick,
      regretChess,
      pass,
    }
  },
}
</script>

<style lang="less" scoped>
.flag {
  margin-top: 3vh;
  text-align: center;
}

.canvas {
  display: block;
  margin: 7vh auto;
  background-color: #989595;
}

.button {
  display: flex;
  justify-content: space-evenly;
}
</style>
