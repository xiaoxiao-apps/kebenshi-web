# c3s2 修复轮 R5c 报告

## 改动
- `exp-melt.html`：四个业务 JS 引用已加 `?v=r5c`（three.min.js 除外），本次未动。
- `exp-melt-core.js`：
  - 烧杯 BEAKER_R=2.8、BEAKER_H=14.0（高:直径=2.5:1），直壁、底部圆角过渡、杯口带小倾倒壶嘴。
  - 水浴 BATH_H=9.5，水面 11.3 低于杯口 15.8。
  - 支架联动：MID_Y=17.2、TOP_Y=21.5、ROD_TOP_Y=22.5、立杆加长。
  - 试管 TUBE_H=10.0、TUBE_CENTRE_Y=12.4，下半球 thetaStart=π/2 最低点 6.0。
  - 样品 SAMPLE_BOTTOM_Y=7.55、SAMPLE_HEIGHT=3.2，全部随管常量派生。
  - 温度计 THERMO_Y=9.0，液泡落入样品区。
  - 相机 SCENE_CENTER=(0,8,0)。

## 自查结果
1. `node --check exp-melt-core.js`：通过。
2. curl 8931：HTML 中 `?v=r5c` 命中 4 处，core.js 中 `r5c` 命中 1 处。
3. 浏览器新标签无 errors；几何断言全过：高径比 2.5、管顶 17.4>rim 15.8>水面 11.3、large 档样品包围盒合规、温度计泡 9.32∈[7.55,10.75]。
4. 物理回归：海波熔 48℃ 平台 frac→1；冰 0℃ 平台；石蜡无平台；海波凝 48℃ 平台 frac→0。
5. 截图已落盘：`docs/c3s2-r5c-wide.png`、`docs/c3s2-r5c-close.png`。

## 结论
JS 缓存根因已修复，烧杯按实物照片重做并全断言通过，可交付蔡总目视。
