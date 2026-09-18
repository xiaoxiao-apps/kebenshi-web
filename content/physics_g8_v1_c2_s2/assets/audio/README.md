# c2s2「声音的特性」音频素材清单（2026-09-18 整理）

全部免费可商用授权。蔡总定：用真实音源，不用 WebAudio 合成乐器声。

## 一、乐器单音样本（FatBoy 音色库，MIT 授权）
来源：github.com/gleitz/midi-js-soundfonts（FatBoy/ 目录，LICENSE=MIT，需保留版权说明）
| 文件 | 用途 |
|------|------|
| piano-do-c4.mp3 ~ piano-c5.mp3（C4 D4 E4 F4 G4 A4 B4 C5 共8个） | 练习5 水瓶琴仿真音阶 do~i；音色对比钢琴 do |
| flute-do-c4.mp3 | 音色对比长笛 do；管乐器示例 |
| violin-do-c4.mp3 | 弦乐器示例 |
| taiko-hit.mp3 | 打击乐器（鼓） |
| bell-c5.mp3 | 钟类（编钟近似音色） |

## 二、真实录音（Freesound，全部 CC0 授权）
| 文件 | 来源ID | 用途 |
|------|--------|------|
| fork-a4-440hz-1.mp3 | freesound 361922（实测440Hz，3.1s，响） | 音叉原型·重敲 |
| fork-a4-440hz-2.mp3 | freesound 331038（实测434Hz，16s，轻） | 响度实验「轻敲」对比 |
| fork-resonance-box.mp3 | freesound 220747（共鸣箱音叉，80s） | 备用/讲解页 |
| ruler-on-table.mp3 | freesound 347392（桌面钢尺拨动） | 想想做做钢尺实验 |
| mosquito-buzz.mp3 | freesound 435650 | 问题导入：蚊子嗡嗡 |
| dizi-sample.mp3 | freesound 108242 | 管乐器（笛子） |
| chinese-bell.mp3 | freesound 705459 | 打击乐器（编钟/钟） |

## 三、移调处理件（自 361922 CC0 重采样，保留真实音色）
| 文件 | 频率 | 用途 |
|------|------|------|
| fork-c4-261.m4a | 实测262Hz=C4 do | 音色对比（与钢琴/长笛 do 同音高） |
| fork-220.m4a | 220Hz | 波形演示·低频（波形稀疏） |
| fork-a4-440.m4a | 440Hz | 波形演示·中频 |
| fork-880.m4a | 880Hz | 波形演示·高频（波形密集） |

处理说明：音叉为近纯音，重采样移调不改变音色特征，频率已用零交叉法实测校验（262/220/880Hz 全命中）。

## 四、修复轮新增（2026-09-18 下午，蔡总验收反馈驱动）
| 文件 | 来源 | 用途 |
|------|------|------|
| bottle-1.wav ~ bottle-8.wav | freesound 679983 CC0 玻璃瓶敲击，取~1366Hz段重采样为 C5~C6 八音 | 水瓶琴仿真（真实玻璃音色，相对音阶准确） |
| slide-tone.wav | freesound 517632 CC0 滑哨，取稳态1s（实测975Hz） | 活塞哨子持续音色（循环+playbackRate变调） |
| dizi-note.mp3 | freesound 384960 CC0 笛子单音（实测882Hz≈A5，7.6s稳定） | 乐器百科「试听笛子」单音样本 |
| ruler-fixed.wav | 自 ruler-on-table.mp3 截取最响0.4s定音段+淡出 | 钢尺拨动定音音效（每次音高固定，playbackRate表长度） |

## 五、说明
- 活塞哨子连续滑音无法用采样实现，该处音调用 WebAudio 合成（哨音本就接近纯音）
- 贾湖骨笛真实照片参考图在 workspace/可交互教材/c2s2_photos/jiahu_a.jpg（五支并排）和 jiahu_c.jpg（单支7孔，SVG渲染主参考）
