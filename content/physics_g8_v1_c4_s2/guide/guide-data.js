'use strict';
/* c4s2 光的反射 · 语音讲解层数据（B 版标配；设计书 docs/c4s2-guide-design.md §1~§4 逐条搬入，文案禁改写）
   模式 key 统一 'refract'（c4s2 为单实验页，引擎 init 后固定 curMode='refract'，无 R.mode 轮询）。
   trigger 存字符串，引擎 new Function 求值；R=window.RFX（render:4 定义，core 原地 mutate，已核实稳定）。
   G.* 为引导层私有字段：G.t / G.modeEnterT / G.angChangeCount / G.lastAngChangeT（监听 R.angleI，350ms 武装，规范§3.2）。
   特殊 trigger 约定（同 c4s3 引擎）：
     "after:c4s2-s1@6000"               = 依赖步触发后延时 6s（规范§2.4，禁 <6000）
     "event:input:#ang-slider:EXPR"     = 滑杆 input capture 即时判态（需引擎适配 A3/A4：tickSteps 跳过 evt 型，事件分发扩展到 steps）
   R3-W4（蔡总反馈12）一步一播改造：
     · s1 删 intro 等待闸门（原 13700ms 模式驻留门控）——用户开激光=电平变化即响，引擎 say() 无条件打断欢迎词；
     · s4 由「电平+自动勾法线函数」回退为 event:change:#cb-normal（用户亲手勾法线才播），core 已删该自动勾选函数；
     · s5 由 after:c4s2-s4@6000 自动接力改为 event:change:#cb-arc（用户勾角度弧才播）；
     · s4/s5 guard 用 document.getElementById(...).checked===true——引擎事件 capture 早于 core bubble 写 R.showNormal/showArc，
       故读 DOM .checked（浏览器派发 change 前已更新）判「勾上」而非「取消勾」，避免取消勾选时误播；
     · s2（after:c4s2-s1@6000 光线命名）保留：蔡总 R2 点名内容、跟随开激光动作的自然延续，非自动接力滥用。 */
window.C4S2_GUIDE={
  refract:{
    intro:{
      text:'欢迎来到光的反射实验室！桌上有激光笔、平面镜和白纸板。点开激光，拖一拖、折一折，反射定律的秘密等你亲手找出来！',
      audio:'c4s2-intro'
    },
    steps:[
      {id:'c4s2-s1',repeat:true,trigger:"R.laserOn===true && R.beamMode==='single' && R.fold===0 && R.rough===0 && !R.pulse.reverse",say:'激光开啦！这束红光射向平面镜，叫入射光线。',audio:'c4s2-s1'},
      {id:'c4s2-s2',repeat:true,queue:true,trigger:'after:c4s2-s1@6000',say:'光打在镜面的 O 点——入射点；反射光也从 O 射出，这条光线叫做反射光线。',audio:'c4s2-s2'},
      {id:'c4s2-s3',repeat:true,trigger:"event:input:#ang-slider:R.laserOn===true && R.beamMode==='single' && R.fold===0 && !R.pulse.reverse",say:'拖动滑杆改入射角，反射角马上跟着变！你看到了吗？',audio:'c4s2-s3'},
      {id:'c4s2-s4',repeat:true,trigger:"event:change:#cb-normal:R.laserOn===true && R.beamMode==='single' && R.fold===0 && R.rough===0 && !R.pulse.reverse && document.getElementById('cb-normal').checked===true",say:'金色虚线是法线，垂直镜面，角都从它量起。再拖拖滑杆。',audio:'c4s2-s4'},
      {id:'c4s2-s5',repeat:true,trigger:"event:change:#cb-arc:document.getElementById('cb-arc').checked===true",say:'看角弧：∠r 和 ∠i 相等，反射角等于入射角！折折纸板试试？',audio:'c4s2-s5'},
      {id:'c4s2-s6',repeat:true,trigger:"event:change:#fold-slider:R.fold>0 && R.laserOn===true && R.beamMode==='single' && !R.pulse.reverse",say:'纸板一折，反射光线所在的平面没有了，光照不到这个平面上，所以就看不到反射光线了。这说明入射光、反射光和法线三线共面。',audio:'c4s2-s6'},/* R5主会话热修：input改change——①引擎事件绑定走capture阶段，input时点R.fold还是旧值（页面listener在bubble才更新）门控永假首折不播；change在松手时发火，R.fold已被页面input listener更新为新值门控成立；②input拖拽连续发火+repeat 500ms去抖=12.6s音频被反复重启卡顿，change一次折叠手势只播一次；事件型自带clearPendingSchedules=折纸板即作废激光第2条在途定时器（蔡总第4条） */
      {id:'c4s2-s6b',repeat:true,trigger:"event:change:#fold-slider:R.fold>0 && R.laserOn===true && R.beamMode==='beam' && R.rough===0",say:'纸板一折，折过去那半边就不在反射光所在的平面里了，上面自然没有反射光——每条光线都这样，三线共面对平行光同样成立。',audio:'c4s2-s6b'},/* R5主会话热修：同s6，input改change（capture旧值门控+拖拽卡顿两因） */
      {id:'c4s2-s7',repeat:true,trigger:"R.pulse.reverse===true && R.laserOn===true && R.fold===0",say:'光路可逆！逆着反射光路射入，就沿原入射路射出。',audio:'c4s2-s7'},
      {id:'c4s2-s8',repeat:true,trigger:"R.beamMode==='beam' && R.laserOn===true && R.rough===0 && R.fold===0 && !R.pulse.reverse",say:'好，接下来换平行光，反射光仍平行，镜面反射。',audio:'c4s2-s8'},
      {id:'c4s2-s9',repeat:true,trigger:"R.rough>0 && R.laserOn===true && R.fold===0 && !R.pulse.reverse",say:'表面变粗糙，反射光散向四面八方，这就是漫反射。',audio:'c4s2-s9'},
      {id:'c4s2-concl',repeat:true,trigger:'after:c4s2-s9@6000',say:'通过刚才的实验，我们发现：三线共面、分居法线两侧、反射角等于入射角，光路还可逆。记住它哦！',audio:'c4s2-concl'}
    ],
    errors:[
      {id:'c4s2-e1',trigger:"event:input:#ang-slider:R.laserOn===false",fix:'不对哟～先点激光笔的红钮开光，再改入射角呀。',audio:'c4s2-e1'},
      {id:'c4s2-e2',trigger:"event:click:#btn-reverse:R.laserOn===false",fix:'不对哟～光还没开呢，先开光源再演示光路可逆。',audio:'c4s2-e2'},
      {id:'c4s2-e3',trigger:"event:change:#surface:R.laserOn===false",fix:'不对哟～先打开光源，再换粗糙面看漫反射哦。',audio:'c4s2-e3'}
    ],
    free:[
      {trigger:"R.dragFb===true && R.laserOn===true && R.beamMode==='single'",note:'拖着激光笔转，入射角实时在变哦。',audio:'c4s2-f1'},
      {trigger:"R.laserOn===true && R.angleI<0.02 && R.beamMode==='single' && R.fold===0 && !R.pulse.reverse",note:'垂直入射：两个角都是 0°，光沿原路返回。',audio:'c4s2-f2'},
      {trigger:"R.showArrow===true && R.laserOn===true",note:'箭头标出传播方向：从 E 经 O 到 F。',audio:'c4s2-f3'},
      {trigger:"event:input:#rough-slider:R.rough>0 && R.laserOn===true",note:'越粗糙，各点法线方向越乱，反射光散得越开。',audio:'c4s2-f4'}
    ],
    tasks:[]
  },
  /* §4 音频 clip 清单 19 条（1 intro + 11 steps + 3 errors + 4 free + 0 tasks，五类 audio 零缺失）；文件名=clip id+'.mp3'；R2-F8 新增 s6b 平行光折叠 */
  audios:{
    'c4s2-intro':'guide/audio/c4s2-intro.mp3',
    'c4s2-s1':'guide/audio/c4s2-s1.mp3',
    'c4s2-s2':'guide/audio/c4s2-s2.mp3?v=20261027r2',
    'c4s2-s3':'guide/audio/c4s2-s3.mp3?v=20261027g1',
    'c4s2-s4':'guide/audio/c4s2-s4.mp3?v=20261027g1',
    'c4s2-s5':'guide/audio/c4s2-s5.mp3?v=20261027g1',
    'c4s2-s6':'guide/audio/c4s2-s6.mp3?v=20261027r2',
    'c4s2-s6b':'guide/audio/c4s2-s6b.mp3',
    'c4s2-s7':'guide/audio/c4s2-s7.mp3?v=20261027g1',
    'c4s2-s8':'guide/audio/c4s2-s8.mp3?v=20261027g1',
    'c4s2-s9':'guide/audio/c4s2-s9.mp3?v=20261027g1',
    'c4s2-concl':'guide/audio/c4s2-concl.mp3?v=20261027g1',
    'c4s2-e1':'guide/audio/c4s2-e1.mp3',
    'c4s2-e2':'guide/audio/c4s2-e2.mp3',
    'c4s2-e3':'guide/audio/c4s2-e3.mp3',
    'c4s2-f1':'guide/audio/c4s2-f1.mp3',
    'c4s2-f2':'guide/audio/c4s2-f2.mp3',
    'c4s2-f3':'guide/audio/c4s2-f3.mp3',
    'c4s2-f4':'guide/audio/c4s2-f4.mp3'
  }
};
window.GUIDE_DATA=window.C4S2_GUIDE;
