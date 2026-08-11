// 十二星座小太空 · 场景图鉴
// 数据真值源: 仓库根 docs/系列设定.md + assets/locations/

export type SceneZone = 'space' | 'far';

export interface Scene {
  id: string;
  name: string;
  zone: SceneZone;
  zoneLabel: string;
  desc: string;
  image: string;
  highlights: string[];   // 3 个视觉亮点
  odId: string;           // data-od-id
}

export const scenes: Scene[] = [
  {
    id: 'star-pool',
    name: '星空泳池',
    zone: 'space',
    zoneLabel: '小太空',
    desc: '水面倒映着星星和月亮,是整个小太空里最像大海的地方。第一集里,双鱼座和水瓶座就是在这里找到了家的感觉。',
    image: '/assets/locations/星空泳池.jpg',
    highlights: ['水面倒映星月', '最像大海的地方', '小美人鱼最爱'],
    odId: 'scene-star-pool',
  },
  {
    id: 'moon-stairs',
    name: '星月楼梯',
    zone: 'space',
    zoneLabel: '小太空',
    desc: '被弯月轻轻环绕的楼梯,台阶上落着小星星。一步一步往上走,就能走到星空最深最深的地方。',
    image: '/assets/locations/星月楼梯.jpg',
    highlights: ['弯月环绕', '星星台阶', '通往星空深处'],
    odId: 'scene-moon-stairs',
  },
  {
    id: 'zodiac-market',
    name: '星座小人超市',
    zone: 'space',
    zoneLabel: '小太空',
    desc: '星座小人们买东西的地方。货架上摆满装星星水的小瓶子和月亮形状的点心,进门时门口的小铃铛会"叮"一声。',
    image: '/assets/locations/星座小人超市.jpg',
    highlights: ['星星瓶货架', '月亮点心', '小铃铛门'],
    odId: 'scene-zodiac-market',
  },
  {
    id: 'green-meadow',
    name: '青青草原',
    zone: 'space',
    zoneLabel: '小太空',
    desc: '一片漂浮在星空里的草原岛,头顶是满天星星,萤火虫提着小灯在草尖上飞。摩羯座和射手座的家乡在很远很远的地方,她们在小太空里找到这片一模一样的草原,也管它叫青青草原。',
    image: '/assets/locations/青青草原.jpg',
    highlights: ['星空下的草原岛', '萤火虫小灯', '草原姐妹的家'],
    odId: 'scene-green-meadow',
  },
  {
    id: 'star-stream',
    name: '星星小溪',
    zone: 'space',
    zoneLabel: '小太空',
    desc: '小太空角落里一条浅浅的小溪,水底铺着圆圆的鹅卵石。一到晚上,满天的星星就掉进溪水里洗澡,洗得一颗一颗亮晶晶的。巨蟹座和天蝎座住在溪边的小房子里,第七集里,她们在这里教会了小螃蟹和小红蝎"轻轻夹"。小溪另一头还住着云螺座——她走过的地方会留下一条亮亮的云螺银线,顺着银线就能找到她家。',
    image: '/assets/locations/星星小溪.jpg',
    highlights: ['星星掉进溪里洗澡', '圆圆的鹅卵石', '溪边小房子', '云螺银线'],
    odId: 'scene-star-stream',
  },
  {
    id: 'moon-farm',
    name: '月光农场',
    zone: 'space',
    zoneLabel: '小太空',
    desc: '金牛座和天秤座的家,围着矮矮的木栅栏,里面种着南瓜、胡萝卜和小蘑菇。这里的蔬菜白天睡觉,一到晚上就一个一个发出暖暖的光,把农场照得亮堂堂的。第十集里,蔬菜一夜全熟了,两个女孩在这里办了收获晚餐,还用金色小天平称出了"心意和心意一样重"。农场的角落里,种着青原座从远方草原寄来的花种子。',
    image: '/assets/locations/月光农场.jpg',
    highlights: ['夜里发光的蔬菜', '金色小天平', '等花开的小土包'],
    odId: 'scene-moon-farm',
  },
  {
    id: 'sunset-sea',
    name: '晚霞海',
    zone: 'far',
    zoneLabel: '远方',
    desc: '真正的大海最边上的一个角,太阳回家的时候,最后一片晚霞总是先落在这里——这是夕海座以前每天傍晚"上班"的地方。大海和天空相接的地方有一条细细的金线,那是太阳用最后的阳光把大海缝好:晚霞,就是大海的金线。',
    image: '/assets/locations/晚霞海.jpg',
    highlights: ['海天相接的金线', '太阳回家的地方', '比泳池大一百倍'],
    odId: 'scene-sunset-sea',
  },
];

export const zoneMap: Record<SceneZone, string> = {
  space: '小太空',
  far: '远方',
};
