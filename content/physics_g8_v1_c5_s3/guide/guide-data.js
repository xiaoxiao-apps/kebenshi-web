/* content/physics_g8_v1_c5_s3/guide/guide-data.js */
/* 语音R2接线波C1：设计书 docs/c5-guide-design-part2.md §B-5 逐字搬入；
   回填（afinfo 实测）：s1 delay 13000→9400（intro 8.424s+1s 取整百）；
   s3 闸门 22000→16400（=s1 delay 9400+s1 音频 4.968s+2s 取整百）
   R7-A2（蔡总 2026-10-28 23:23 条3）：①s3/s4 触发加 |u−2f|>0.25 排除带（s5 判定带 |u−2f|<=0.25，
   原 s3/s4 无排除带→u 恰=2f 时 s3/s5 双真、数组序 s3 在前抢先，误报「大于二倍焦距缩小」）；
   ②文案去字母改中文（intro/s1/s3~s7/e2 重录，afinfo 2026-10-29 实测：intro 10.080s、s1 4.560s、
   s3 5.016s、s4 5.856s、s5 6.552s、s6 4.608s、s7 6.456s、e2 4.896s；intro 变长后 s1 按当时的延时值
   发火时 intro 未播完，靠 queue:true 依契约6 defer 至播完再上）；
   ③全部 steps+errors 加 queue:true（重置后电平条等 intro 播完再上，不再掐欢迎词）；s11 结论改非 repeat 单次播
   R8-2（蔡总 2026-10-29 01:17 条3）：s1 延时 9400→11100 + 文案改「先点亮光源…」（重录）；新增 s1b=点亮光源后的播报（新录） */
window.C5S3_GUIDE={
  refract:{
    intro:{text:'光具座探究成像规律，拖动光源改变物距，拖动光屏找像。一倍焦距和二倍焦距是两条分界线。',audio:'c5s3-intro'},
    steps:[
      /* R8-2（蔡总 2026-10-29 01:17 条3）：欢迎词之后先引导点亮光源——s1 延时抬到 11100（intro afinfo 实测 10.080s + 1s 取整百）
         且文案改「先点亮光源…」；新增 s1b = 点亮光源后的播报（repeat:true 走上升沿，st.lit 假→真发一次，非持续电平故不自我复读）。
         s1b 是**用户动作条 → 不加 queue**（契约6 R8-1 规则：用户一操作立即打断在播音频，含欢迎词）。
         已 grep 核：全文件无 after:c5s3-s1 下游依赖（唯一 after: 是 s11 挂 s10），故 s1 改延时不需迁挂 */
      /* R10（蔡总 2026-10-29 13:03 条1）：s1 由裸 delay:11100 改电平门——没点亮才播、已点亮永久闭嘴（过期引导不再出现）；queue:true 保留（等 intro 播完） */
      {id:'c5s3-s1',repeat:true,queue:true,trigger:'(G.t-G.modeEnterT)>11100 && R.lit===false',say:'先点亮光源，再拖动光源改变物距，拖动光屏找清晰的像。',audio:'c5s3-s1'},
      {id:'c5s3-s1b',repeat:true,trigger:'R.lit===true',say:'看，光源从上、中、下三处发出平行光，射向凸透镜。',audio:'c5s3-s1b'},
      /* R10：提醒条——未点亮光源时任何瞎操作（lastActT 由 core document 级 pointerdown 刷新，排除 #btn-lit）当帧发「请先点亮光源」。
         电平边沿型：操作刷新 lastActT→条件假→下一帧真上升沿即发火；repeat 边沿+引擎 REP_COOLDOWN=3000 天然防刷屏（连点3秒内只提醒一次）；
         **不加 queue**=动作响应立即播，打断欢迎词符合蔡总规矩（R8-1 契约6：用户动作条一律不加 queue） */
      {id:'c5s3-s1c',repeat:true,trigger:'R.lit===false && (G.t-R.lastActT)>=0 && (G.t-R.lastActT)<1500',say:'请先点亮光源。',audio:'c5s3-s1c'},
      {id:'c5s3-s2',repeat:true,queue:true,trigger:'R.lit===true && R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))>0.6',say:'屏上像模糊啦，拖屏或点寻像找清晰像。',audio:'c5s3-s2'},/* R10：加已点亮门（蔡总：只有点亮才触发接下来的步骤），下同 s3~s10/e1~e3/f1~f4 共15条 */
      {id:'c5s3-s3',repeat:true,queue:true,trigger:'R.lit===true && R.u>2*R.f && R.u-R.f>0.25 && Math.abs(R.u-2*R.f)>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6',say:'现在物距大于二倍焦距，成倒立、缩小的实像。',audio:'c5s3-s3'},   /* R7-A2：加 |u−2f|>0.25 排除带，u=2f 时让位 s5 */
      {id:'c5s3-s4',repeat:true,queue:true,trigger:'R.lit===true && R.u-R.f>0.25 && R.u<2*R.f && Math.abs(R.u-2*R.f)>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))<=0.6',say:'物距在一倍焦距和二倍焦距之间，成倒立、放大的实像。',audio:'c5s3-s4'},   /* R7-A2：同款排除带 */
      {id:'c5s3-s5',repeat:true,queue:true,trigger:'R.lit===true && Math.abs(R.u-2*R.f)<=0.25',say:'物距等于二倍焦距，成倒立、等大的实像，这是放大缩小的分界点。',audio:'c5s3-s5'},
      {id:'c5s3-s6',repeat:true,queue:true,trigger:'R.lit===true && Math.abs(R.u-R.f)<=0.25',say:'物距等于一倍焦距时不成像，一倍焦距分虚实。',audio:'c5s3-s6'},
      {id:'c5s3-s7',repeat:true,queue:true,trigger:'R.lit===true && R.f-R.u>0.25',say:'物距小于一倍焦距，成正立、放大的虚像，物和像在透镜同侧。',audio:'c5s3-s7'},
      {id:'c5s3-s8',repeat:true,queue:true,trigger:'R.lit===true && R.screenOn===false && R.f-R.u>0.25',say:'撤去光屏，用眼从屏侧观察虚像。',audio:'c5s3-s8'},
      {id:'c5s3-s9',repeat:true,queue:true,trigger:'R.lit===true && R.rows.length>=1 && R.rows.length<3',say:'记下一笔啦！跨三个区每区记一笔。',audio:'c5s3-s9'},
      {id:'c5s3-s10',repeat:true,queue:true,trigger:'R.lit===true && R.rows.length>=3',say:'三组数据齐了，开规律卡对照归纳。',audio:'c5s3-s10'},
      {id:'c5s3-s11',repeat:false,queue:true,trigger:'after:c5s3-s10@6000',say:'因此我们得出结论：一倍焦距分虚实，二倍焦距分大小。',audio:'c5s3-s11'}
    ],
    errors:[
      {id:'c5s3-e1',queue:true,trigger:'event:click:#btn-record:R.lit===true && R.u-R.f>0.25 && Math.abs(R.vSc-R.u*R.f/(R.u-R.f))>0.6',fix:'不对哟～屏上像还模糊，先寻像再记录哦。',audio:'c5s3-e1'},
      {id:'c5s3-e2',queue:true,trigger:'event:click:#btn-auto:R.lit===true && Math.abs(R.u-R.f)<=0.25',fix:'不对哟～物距等于一倍焦距时不成像，寻像也没用呀。',audio:'c5s3-e2'},
      {id:'c5s3-e3',queue:true,trigger:'event:click:#btn-auto:R.lit===true && R.f-R.u>0.25',fix:'不对哟～虚像屏接不到，撤屏用眼睛看。',audio:'c5s3-e3'}
    ],
    free:[
      {trigger:'R.lit===true && R.hand===true && R.u-R.f>0.25',note:'遮住透镜一部分，像仍完整只是变暗。',audio:'c5s3-f1'},
      {trigger:'event:click:#btn-auto:R.lit===true && R.u-R.f>0.25',note:'寻像按钮会自动把屏滑到清晰像位。',audio:'c5s3-f2'},
      {trigger:'R.lit===true && R.hand===true && R.f-R.u>0.25',note:'遮挡时虚像也完整，只是变暗哟。',audio:'c5s3-f3'},
      {trigger:'R.lit===true && R.obj===\'candle\'',note:'换成蜡烛作物体啦，像变烛焰图案。',audio:'c5s3-f4'}
    ],
    tasks:[]
  },
  audios:{
    'c5s3-intro':'guide/audio/c5s3-intro.mp3?v=20261029v1',
    'c5s3-s1':'guide/audio/c5s3-s1.mp3?v=20261029v2','c5s3-s1b':'guide/audio/c5s3-s1b.mp3?v=20261029v2',
    'c5s3-s1c':'guide/audio/c5s3-s1c.mp3?v=20261029v5',
    'c5s3-s2':'guide/audio/c5s3-s2.mp3',
    'c5s3-s3':'guide/audio/c5s3-s3.mp3?v=20261029v1','c5s3-s4':'guide/audio/c5s3-s4.mp3?v=20261029v1',
    'c5s3-s5':'guide/audio/c5s3-s5.mp3?v=20261029v1','c5s3-s6':'guide/audio/c5s3-s6.mp3?v=20261029v1',
    'c5s3-s7':'guide/audio/c5s3-s7.mp3?v=20261029v1','c5s3-s8':'guide/audio/c5s3-s8.mp3',
    'c5s3-s9':'guide/audio/c5s3-s9.mp3','c5s3-s10':'guide/audio/c5s3-s10.mp3',
    'c5s3-s11':'guide/audio/c5s3-s11.mp3',
    'c5s3-e1':'guide/audio/c5s3-e1.mp3','c5s3-e2':'guide/audio/c5s3-e2.mp3?v=20261029v1',
    'c5s3-e3':'guide/audio/c5s3-e3.mp3',
    'c5s3-f1':'guide/audio/c5s3-f1.mp3','c5s3-f2':'guide/audio/c5s3-f2.mp3',
    'c5s3-f3':'guide/audio/c5s3-f3.mp3','c5s3-f4':'guide/audio/c5s3-f4.mp3'
  }
};
window.GUIDE_CFG={state:window.C5S3_STATE,mode:'refract'};
window.GUIDE_DATA=window.C5S3_GUIDE;
