import { createStore } from 'vuex'
import auth from './modules/auth'
import game from './modules/game'
import user from './modules/user'
import quiz from './modules/quiz'

export default createStore({
  modules: {
    auth,
    game,
    user,
    quiz
  }
})