<template>
  <div id="app">
    <el-scrollbar style="height:100px">
      <div class="inner"
           style="height:1000px;">
        <div class="RichText ztext Post-RichText">
          <p>丽宇芳林对高阁，新妆艳质本倾城。</p>
          <p>映户凝娇乍不进，出帷含态笑相迎。</p>
          <p>妖姬脸似花含露，玉树流光照后庭。</p>
          <p>花开花落不长久，落红满地归寂中。</p>
          <p>这边是南朝陈后主陈叔宝所作的著名的亡国之音《玉树后庭花》，也是唐代杜牧“商女不知亡国恨，隔江犹唱后庭花”一句的出处。</p>
          <p>陈叔宝时代的诗歌在格律方面所作出的贡献是为学术界所公认的，而陈后主宫廷文人群体的成员在这方面作出的成绩，也是非常显著的，以陈后主和江总最为突出。</p>
          <p>陈后主是创作艳情诗的高手，主要集中在拟乐府诗歌当中，诗歌留存有99篇。在沿用乐府旧题的同时，陈后主宫廷文人对乐府旧题进行了改造，创作出大量异于前人的作品。</p>
          <p>陈后主在位期间不仅大力提倡“清商乐”，让乐府为其提供娱乐性的歌舞表演，他还亲自创作“吴歌”，如《玉树后庭花》等作，然后交由后宫美人学习，再演唱给他欣赏。</p>
          <p>由于陈后主精通音乐，且造诣颇高，这使得他可以与宫廷乐人很好合作。因此，流行于宫廷的“新辞协乐”之曲便应运而生。而这一时期的新声制作也形成了其特有的宫廷风格，尤其是陈后主对于七言句式的运用，使得当时新声音乐在曲式等方面有了较大的变化。</p>
          <p>陈后主陈叔宝（553年-604年），吴兴郡长城县（浙江长兴）人，582年登基皇位，是南朝末代皇帝。在位期间荒废朝政，耽于酒色，醉心诗文和音乐。589年隋军大举南下，攻破广陵、京口和都城建康。陈叔宝被掳至长安，受封长城县公。隋文帝杨坚赐予宅邸，礼遇甚厚。604年陈叔宝病逝于洛阳，终年五十二岁，安葬于洛阳邙山。</p>
          <p>一曲著名的亡国之音《玉树后庭花》流传千年。“花开花落不长久，落红满地归寂中”一语成谶。上帝是公平的，南朝陈后主陈叔宝成为了亡国之音的创造者与实践者。</p>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import ElScrollbar from '@/components/scrollbar'
export default {
  components: {
    ElScrollbar
  },
  data() {
    return {
      pwd: '12346'
    }
  },
  methods: {
    showMessage() {
      Notification({
        title: '提示',
        message: '这是一条不会自动关闭的消息'
      })
    }
  }
}
</script>

<style lang="stylus">
#app
  .scrollbar__wrap
    overflow-x auto
.dark
  background-color orange
  color white
.scrollbar
  position relative
  overflow hidden
  transition padding-top 0.3s
  &:hover>.scrollbar__bar
    opacity 1
.scrollbar__wrap
  height 100%
  overflow scroll
.scrollbar__bar
  position absolute
  right 2px
  bottom 2px
  z-index 1
  border-radius 4px
  opacity 0
  transition opacity 0.12s ease-out
  &.is-vertical
    width 6px
    top 2px
.scrollbar__thumb
  position relative
  display block
  width 100%
  height 0
  cursor pointer
  border-radius inherit
  background-color rgba(144, 147, 153, 0.3)
  transition background-color 0.3s
</style>