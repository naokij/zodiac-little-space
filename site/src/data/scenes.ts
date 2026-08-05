// 十二星座小太空 · 场景图鉴
// 数据真值源: 仓库根 docs/系列设定.md + assets/locations/

export type SceneZone = 'space';

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
];

export const zoneMap: Record<SceneZone, string> = {
  space: '小太空',
};
