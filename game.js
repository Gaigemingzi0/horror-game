const game = {
    scenes: {},
    currentScene: null,
    visitedScenes: [],
    endingsUnlocked: [],
    audioEnabled: true,
    musicEnabled: true,
    audioContext: null,
    isTransitioning: false,
    ambientOscillators: [],
    ambientGain: null,

    init() {
        this.loadGameContent();
        this.setupEventListeners();
    },

    async ensureAudioReady() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Web Audio API not supported:', e);
                return false;
            }
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        return this.audioContext.state === 'running';
    },

    loadGameContent() {
        this.scenes = {
            scene_1: {
                id: 'scene_1',
                title: '🚪 庄园大门',
                content: [
                    '铁门半掩，门后是一条铺满枯叶的碎石路。庄园的窗户像一只只死去的眼睛。你感到一阵冰冷的目光扫过脖颈。',
                    '你收到一封泛黄的信，笔迹是你失踪七年的哥哥的。信上只有一行字："回来……它在等你。庄园的秘密，今夜必须终结。"',
                    '你驱车回到故乡那座被遗忘的"泪目庄园"。车在途中抛锚，你只能步行穿过浓雾弥漫的枯木林。天色已暗，乌鸦在头顶盘旋。庄园的铁门在风中吱呀作响……'
                ],
                choices: [
                    { text: '🔦 推门走进庄园', target: 'scene_2' },
                    { text: '🗡️ 绕到庄园侧面，从厨房后门进入', target: 'scene_3' },
                    { text: '📜 掏出那封信，对着大门念出上面的字', target: 'scene_4' },
                    { text: '🚶‍♂️ 转身离开', target: 'ending_1' }
                ]
            },
            scene_2: {
                id: 'scene_2',
                title: '🏰 主厅',
                content: [
                    '你推开沉重的橡木门，一股霉味和铁锈味扑面而来。大厅中央有一盏碎裂的水晶吊灯，墙上挂着一幅黑布蒙住的画像。壁炉里突然自己燃起了绿色的火焰。',
                    '楼梯口站着一个小女孩的白色影子，她慢慢转过头——脸是空白的。"你……是来陪我玩的吗？" 声音从四面八方传来。'
                ],
                choices: [
                    { text: '😨 尖叫着跑上二楼', target: 'scene_5' },
                    { text: '🔥 捡起一根木棍，伸进绿色火焰中点燃', target: 'scene_6' },
                    { text: '🖼️ 撕开那幅画像上的黑布', target: 'scene_7' },
                    { text: '🙏 闭上眼睛，轻声说："哥哥，是你吗？"', target: 'scene_8' }
                ]
            },
            scene_3: {
                id: 'scene_3',
                title: '🍽️ 厨房',
                content: [
                    '后门没锁。厨房里锅碗瓢盆散落一地，灶台上放着一碗仍然冒着热气的汤——像是刚做好的。碗底压着一把带血的菜刀和一本发霉的日记。',
                    '你翻开日记，最后一页写着："它模仿声音。别信。地下室有唯一的方法。"',
                    '突然，水管里发出咕噜声，水龙头自己打开，流出黑色的液体，里面漂浮着眼球……'
                ],
                choices: [
                    { text: '🔪 拿起菜刀，冲向地下室入口', target: 'scene_9' },
                    { text: '📖 把日记塞进口袋，悄悄退出厨房', target: 'scene_2' },
                    { text: '🍲 喝一口那碗汤', target: 'ending_2' }
                ]
            },
            scene_4: {
                id: 'scene_4',
                title: '🗣️ 念信',
                content: [
                    '你高声念出信上的字。话音刚落，铁门自动敞开，一阵刺骨阴风把你卷进大厅。你摔倒在地，抬头看见——所有家具都漂浮在空中，然后瞬间砸落。',
                    '大厅中央的画像上的黑布自己脱落，露出一个没有五官的男人。他开口，声音是你哥哥的："你终于来了……我需要你的身体。"',
                    '墙壁开始渗血，天花板上垂下无数根绳索，像绞刑的套索。'
                ],
                choices: [
                    { text: '✝️ 掏出随身带的十字架', target: 'scene_10' },
                    { text: '🏃‍♂️ 朝地下室的方向狂奔', target: 'scene_9' },
                    { text: '💬 对着画像大喊："你根本不是哥哥！"', target: 'scene_11' }
                ]
            },
            scene_5: {
                id: 'scene_5',
                title: '🛏️ 二楼走廊',
                content: [
                    '走廊两侧挂着家族成员的照片，所有人的眼睛都盯着你。走到第三间房时，你听到里面传来母亲哼唱的摇篮曲——但你母亲十年前就去世了。',
                    '门虚掩着，里面有一张摇椅，上面放着你的旧布娃娃。娃娃的头突然转向你："它在你后面。"'
                ],
                choices: [
                    { text: '🚪 立刻冲进房间锁上门', target: 'scene_12' },
                    { text: '🏃 转身朝楼梯跑回去', target: 'scene_13' },
                    { text: '🧸 捡起布娃娃，撕开它的肚子', target: 'scene_14' }
                ]
            },
            scene_6: {
                id: 'scene_6',
                title: '🔥 点燃木棍',
                content: [
                    '木棍在绿火中燃起，火焰却是冰冷的。你举着它走到画像前，烧掉了黑布——画中是一个被荆棘缠住的男人，他的眼睛里流出血泪，嘴巴一张一合："镜子……打破镜子……"',
                    '此时，大厅角落的一面穿衣镜映出了你身后——有一个长着多只手臂的黑色人影正缓缓抱住你。'
                ],
                choices: [
                    { text: '🔨 抓起椅子砸向镜子', target: 'scene_15' },
                    { text: '🏃‍♂️ 不顾一切冲向地下室', target: 'scene_9' },
                    { text: '😭 回头直视那个人影', target: 'ending_3' }
                ]
            },
            scene_7: {
                id: 'scene_7',
                title: '🖼️ 撕开黑布',
                content: [
                    '黑布坠落的一瞬间，大厅里所有的灯全部熄灭。只有画框里发出幽暗的光。画中的男人竟然活了过来，一只苍白的手伸出画布，死死掐住你的脖子。',
                    '"你撕开了封印……谢谢。" 他的脸开始扭曲，变成你哥哥的模样。'
                ],
                choices: [
                    { text: '🔪 用随身小刀刺那只手', target: 'scene_16' },
                    { text: '🙏 念出你儿时和哥哥约定的暗号', target: 'scene_8' },
                    { text: '💀 放弃挣扎', target: 'ending_4' }
                ]
            },
            scene_8: {
                id: 'scene_8',
                title: '👥 呼唤哥哥',
                content: [
                    '你闭上眼，轻声喊出你们小时候的暗号："乌鸦飞过月亮时，我在树屋等你。"',
                    '绿火熄灭了。小女孩的白色影子停住了。一个颤抖的声音从楼梯上方传来："弟弟……快跑……它在地下室最底层，不要看它的眼睛……用……"',
                    '话没说完，声音变成惨叫，然后寂静。楼梯上滚下来一颗眼珠，上面写着："祭坛后。"'
                ],
                choices: [
                    { text: '🕯️ 找手电筒，朝地下室前进', target: 'scene_9' },
                    { text: '❓ 先上二楼，找哥哥', target: 'scene_5' },
                    { text: '🔮 捡起眼珠，对着它念出祭坛的咒语', target: 'scene_17' }
                ]
            },
            scene_9: {
                id: 'scene_9',
                title: '⛓️ 地下室入口',
                content: [
                    '木门已经被撬开，台阶向下延伸，每一级都湿漉漉的，像踩在舌头上。墙壁上刻着扭曲的文字："抛弃名字，方可活命。"',
                    '地下深处传来锁链拖拽的声音和低沉的呼吸。你的手电筒照到墙角——那里蹲着一个人影，浑身是血，抬起头，是你哥哥的脸，但他只有一只眼睛，另一只眼眶里爬出蜈蚣。',
                    '"别……下……去……它醒了。"'
                ],
                choices: [
                    { text: '🚶‍♂️ 扶起哥哥，一起往外跑', target: 'scene_18' },
                    { text: '🔦 独自继续走下台阶', target: 'scene_19' },
                    { text: '🕯️ 把手电筒扔进黑暗深处，自己退出去', target: 'ending_5' }
                ]
            },
            scene_10: {
                id: 'scene_10',
                title: '✝️ 十字架',
                content: [
                    '十字架发出强光，无脸男人发出刺耳的尖叫，画像开始燃烧。但你手中的十字架迅速变黑、碎裂。天花板上的绳索像蛇一样缠住你的手脚，把你吊起半空。',
                    '男人走到你面前，把脸贴在你脸上——你的五官开始消失，转移到他的脸上。',
                    '"谢谢你给我面容。现在，你代替我留在这里。"',
                    '你的意识逐渐模糊，最后听到的是铁门关上的声音。'
                ],
                choices: [
                    { text: '💀 接受命运', target: 'ending_6' }
                ]
            },
            scene_11: {
                id: 'scene_11',
                title: '🗣️ 大喊真相',
                content: [
                    '你吼出那句话。整个庄园猛烈震动，画像中的男人突然像瓷器一样裂开，碎片四溅。从画框后面掉出一把锈蚀的钥匙和一盘磁带。',
                    '你捡起磁带，上面的标签写着："地下室，别听第3首。" 但地板开始裂开，无数只手从地下伸出抓你的脚踝。'
                ],
                choices: [
                    { text: '🎵 当场播放磁带', target: 'scene_20' },
                    { text: '🔑 拿着钥匙冲向地下室', target: 'scene_9' },
                    { text: '🪦 把钥匙插进地板裂缝里', target: 'scene_21' }
                ]
            },
            scene_12: {
                id: 'scene_12',
                title: '🚪 锁门',
                content: [
                    '你冲进房间锁上门，摇椅还在摇，布娃娃在地上。你松了一口气，转头看见床底下——蹲着一个人，浑身是血，正是你哥哥。他嘴唇颤抖："你锁住的不是它，是我。它在门外。"',
                    '门外传来敲门声，一个和你一模一样的声音说："开门，我是真的。"'
                ],
                choices: [
                    { text: '🔑 开门', target: 'scene_22' },
                    { text: '🛏️ 躲进衣柜', target: 'scene_23' },
                    { text: '🔪 用剪刀刺向床底下的"哥哥"', target: 'scene_24' }
                ]
            },
            scene_13: {
                id: 'scene_13',
                title: '🏃 跑向楼梯',
                content: [
                    '你转身猛跑，走廊里的画全部倾斜，画中人的手伸出来试图抓你。跑到楼梯口时，你一脚踩空，滚下楼梯，头撞在大厅的壁炉角上。',
                    '鲜血模糊了视线。你看到那个小女孩的白色影子蹲在你身边，轻声唱："睡吧，睡吧，再也醒不来。"',
                    '她伸出没有手指的手掌，盖住你的脸。'
                ],
                choices: [
                    { text: '😴 闭上眼睛', target: 'ending_7' }
                ]
            },
            scene_14: {
                id: 'scene_14',
                title: '🧸 撕开布娃娃',
                content: [
                    '娃娃肚子里塞满了头发和牙齿，还有一张小纸条："它怕光，但更怕真相。"',
                    '此时，房间的灯突然全部亮起。门外的敲门声停了。你听到楼下传来巨大的爆炸声——地下室的门被炸开，一道金色的光束冲上天空。',
                    '你跑下楼，发现大厅的地面裂开，下面是一个巨大的眼睛，正在慢慢闭合。你哥哥的声音从光中传来："跳下去！我们一起封印它！"'
                ],
                choices: [
                    { text: '🌟 跳进光束中', target: 'scene_25' },
                    { text: '🧍‍♂️ 犹豫站在原地', target: 'ending_8' }
                ]
            },
            scene_15: {
                id: 'scene_15',
                title: '🔨 打破镜子',
                content: [
                    '镜子碎裂的瞬间，每一个碎片里都映出不同年代的你——从婴儿到衰老。黑影尖叫着蒸发。但你的左手也开始变得透明，像玻璃一样脆弱。',
                    '你哥哥的鬼魂出现在碎片中，说："它的一部分在你体内。你永远走不出这座庄园了。"'
                ],
                choices: [
                    { text: '🪞 接受命运', target: 'ending_9' }
                ]
            },
            scene_16: {
                id: 'scene_16',
                title: '🔪 刺向画中手',
                content: [
                    '小刀扎进那只手，它缩回画布，但画框里涌出大量的黑色液体，迅速淹没你的脚踝。黑色液体中有无数只眼睛盯着你。你的皮肤开始溃烂。',
                    '"你伤了它，它要吃掉你。"',
                    '你挣扎着朝大门爬去，但液体凝固成柏油般的地面，你渐渐下沉，最后只留下一只手伸在外面。'
                ],
                choices: [
                    { text: '🆘 绝望挣扎', target: 'ending_10' }
                ]
            },
            scene_17: {
                id: 'scene_17',
                title: '🔮 念出咒语',
                content: [
                    '你对着眼珠念出日记里的咒语："阿图尔·沙斯·维。"',
                    '眼珠炸开，化成粉末。整个庄园开始剧烈摇晃，所有窗户同时碎裂。地下室传来远古的怒吼。一道裂缝从你脚下延伸，你掉进一个充满光亮的空洞，下方是一个巨大的石质祭坛，上面插着一把银色的匕首。',
                    '一个声音在你脑海响起："刺入心脏——你的，或者它的。"'
                ],
                choices: [
                    { text: '🔪 拿起匕首，刺向自己的心脏', target: 'ending_11' },
                    { text: '🗡️ 寻找怪物的心脏', target: 'scene_19' }
                ]
            },
            scene_18: {
                id: 'scene_18',
                title: '🏃 扶起哥哥逃跑',
                content: [
                    '你搀扶着哥哥拼命往大门跑。身后的地下室喷出黑烟，黑烟凝成无数张脸。跑到门口时，哥哥突然用力把你推出铁门，然后自己关上门，背靠着门。',
                    '他回头对你微笑，那只完好的眼睛流下血泪："我欠你的。别回头，锁上铁门，快走！"',
                    '铁门自己锁上了。门缝里伸出一只手，把你哥哥拖了进去。你听到他的笑声，然后是撕碎声。',
                    '你站在月光下，手里多了一把钥匙，上面刻着："自由。"'
                ],
                choices: [
                    { text: '🗝️ 握紧钥匙离开', target: 'ending_12' }
                ]
            },
            scene_19: {
                id: 'scene_19',
                title: '🕳️ 独自深入',
                content: [
                    '台阶尽头是一个巨大的地下洞穴。中央有一座石质祭坛，上面绑着一具干尸，心脏位置插着一把银匕首。祭坛周围是无数只倒挂的蝙蝠，它们突然全部睁开红色的眼睛。',
                    '干尸开口，声音是你自己的："拔出匕首，释放我……或者刺向我，杀死你自己。"'
                ],
                choices: [
                    { text: '⚔️ 拔出匕首', target: 'ending_13' },
                    { text: '💀 将匕首刺得更深', target: 'ending_14' },
                    { text: '🔥 用打火机点燃祭坛上的油', target: 'scene_26' }
                ]
            },
            scene_20: {
                id: 'scene_20',
                title: '📼 播放磁带',
                content: [
                    '录音机里传来你年幼时的声音，你在唱一首儿歌。唱到第三首时，声音变了，变成一种完全陌生的语言。墙壁上开始浮现出扭曲的符文，所有的影子都站立起来，把你围在中间。',
                    '你脚下的地板突然打开，你坠入一个全是镜子的房间。每个镜子里都是你不同的死法。',
                    '你被困在镜像迷宫里，永远找不到出口。'
                ],
                choices: [
                    { text: '🪞 永远困在这里', target: 'ending_15' }
                ]
            },
            scene_21: {
                id: 'scene_21',
                title: '🔑 钥匙插入裂缝',
                content: [
                    '钥匙插入的瞬间，地板裂开成巨大的口子，你掉了下去，落在一堆白骨上。抬头一看，这是一个万人坑。白骨堆里有一只手还握着树枝，上面刻着："2024年10月，第47个牺牲者。"',
                    '你才发现钥匙孔其实是怪物的嘴。最后的声音："欢迎加入我的收藏。"'
                ],
                choices: [
                    { text: '💀 成为收藏', target: 'ending_16' }
                ]
            },
            scene_22: {
                id: 'scene_22',
                title: '🚪 开门',
                content: [
                    '你打开门，门外站着另一个"你"，一模一样，连伤疤都在同一位置。他笑着走进来，一拳把你打晕。',
                    '醒来时，你被锁在床底下，而"他"躺在你的床上，对你哥哥的声音说："没事了，我把那东西解决了。"',
                    '然后，床底下的你，嘴巴被缝上了。你永远无法出声。'
                ],
                choices: [
                    { text: '🗣️ 无法呼喊', target: 'ending_17' }
                ]
            },
            scene_23: {
                id: 'scene_23',
                title: '🚪 躲进衣柜',
                content: [
                    '你躲在衣柜里，听到门被打开，两个声音争吵——一个是你哥哥，一个是"它"。然后一切都安静了。',
                    '衣柜门缝里渗进黑色的液体，你捂住口鼻，但液体还是钻进了你的耳朵。',
                    '你失去了意识，醒来时发现自己变成了一幅画像，挂在走廊上，永远睁着眼。'
                ],
                choices: [
                    { text: '🖼️ 成为收藏', target: 'ending_18' }
                ]
            },
            scene_24: {
                id: 'scene_24',
                title: '🔪 刺向床底下的"哥哥"',
                content: [
                    '剪刀刺入后，床底下的哥哥惨叫着化成黑烟。真正的哥哥从门外冲进来，抱住你："你杀了它的分身！快，它本体在大厅，我们一起……"',
                    '话没说完，天花板上垂下一只巨大的手，抓住哥哥的脖子，把他拖出窗外。',
                    '你冲到窗边，外面只有黑暗。'
                ],
                choices: [
                    { text: '🔫 拿起剪刀和手电筒，下楼', target: 'scene_9' },
                    { text: '💔 爬上窗台，跳下去', target: 'ending_19' }
                ]
            },
            scene_25: {
                id: 'scene_25',
                title: '🌟 跳进光束',
                content: [
                    '你和哥哥的灵魂一起坠入光束。光中，你看到了庄园的过去——一个古老的仪式失败了，某种东西被囚禁在地下。你需要重新完成仪式，代价是将自己的记忆献祭。',
                    '哥哥对你点头："忘了我，就能封印它。"',
                    '光束中浮现出一本契约书，上面需要你的签名。'
                ],
                choices: [
                    { text: '✍️ 签下名字', target: 'ending_20' },
                    { text: '❌ 撕掉契约', target: 'ending_13' }
                ]
            },
            scene_26: {
                id: 'scene_26',
                title: '🔥 点燃祭坛',
                content: [
                    '火焰燃起，干尸发出凄厉的尖叫，所有的蝙蝠扑向你。你被蝙蝠淹没，但火焰也烧断了束缚。干尸站起来，是你哥哥……不，是它的真身——一个没有皮肉的怪物。',
                    '怪物抱住你，火焰吞噬你们俩。在最后一刻，你听到哥哥的声音："谢谢你……把我从它体内解放。"',
                    '你和怪物一起化为灰烬。庄园倒塌。',
                    '第二天，人们在废墟中发现一具焦尸，手中紧紧握着一张照片——是你和哥哥的合影。'
                ],
                choices: [
                    { text: '💀 化为灰烬', target: 'ending_21' }
                ]
            },
            ending_1: {
                id: 'ending_1',
                title: '胆小鬼的生路',
                content: ['你离开庄园，但一辈子听到哥哥的哭声。'],
                isEnding: true,
                endingNumber: 1
            },
            ending_2: {
                id: 'ending_2',
                title: '毒汤',
                content: ['汤里有诅咒，你变成厨房里的幽灵。'],
                isEnding: true,
                endingNumber: 2
            },
            ending_3: {
                id: 'ending_3',
                title: '直视深渊',
                content: ['你回头，黑影吞噬了你的灵魂。'],
                isEnding: true,
                endingNumber: 3
            },
            ending_4: {
                id: 'ending_4',
                title: '放弃挣扎',
                content: ['你被拖进画中，成了新的囚徒。'],
                isEnding: true,
                endingNumber: 4
            },
            ending_5: {
                id: 'ending_5',
                title: '逃离的懦夫',
                content: ['你逃出庄园，但怪物通过你的影子跟着你。'],
                isEnding: true,
                endingNumber: 5
            },
            ending_6: {
                id: 'ending_6',
                title: '面容的献祭',
                content: ['你的脸被夺走，永远困在画像里。'],
                isEnding: true,
                endingNumber: 6
            },
            ending_7: {
                id: 'ending_7',
                title: '永恒的摇篮曲',
                content: ['你在楼梯底死去，成为小女孩的玩伴。'],
                isEnding: true,
                endingNumber: 7
            },
            ending_8: {
                id: 'ending_8',
                title: '真相之罚',
                content: ['光束消失，你永远困在半崩塌的庄园。'],
                isEnding: true,
                endingNumber: 8
            },
            ending_9: {
                id: 'ending_9',
                title: '镜中余生',
                content: ['你活着但半透明，无法离开庄园的镜子。'],
                isEnding: true,
                endingNumber: 9
            },
            ending_10: {
                id: 'ending_10',
                title: '画中的养分',
                content: ['你被黑色液体吞噬，成为画的一部分。'],
                isEnding: true,
                endingNumber: 10
            },
            ending_11: {
                id: 'ending_11',
                title: '自我牺牲',
                content: ['你刺死自己，仪式完成，庄园净化。'],
                isEnding: true,
                endingNumber: 11
            },
            ending_12: {
                id: 'ending_12',
                title: '哥哥的赎罪',
                content: ['哥哥代替你被拖走，你活下来。'],
                isEnding: true,
                endingNumber: 12
            },
            ending_13: {
                id: 'ending_13',
                title: '释放怪物',
                content: ['你拔出匕首，怪物现世，世界陷入黑暗。'],
                isEnding: true,
                endingNumber: 13
            },
            ending_14: {
                id: 'ending_14',
                title: '彻底封印',
                content: ['你刺深匕首，怪物炸裂，你和庄园同归于尽。'],
                isEnding: true,
                endingNumber: 14
            },
            ending_15: {
                id: 'ending_15',
                title: '声音的囚笼',
                content: ['你困在镜子迷宫里，永远听到自己的回音。'],
                isEnding: true,
                endingNumber: 15
            },
            ending_16: {
                id: 'ending_16',
                title: '第48个',
                content: ['你成为白骨坑中的又一副骨架。'],
                isEnding: true,
                endingNumber: 16
            },
            ending_17: {
                id: 'ending_17',
                title: '被替代',
                content: ['怪物变成你，取代你的人生。'],
                isEnding: true,
                endingNumber: 17
            },
            ending_18: {
                id: 'ending_18',
                title: '画像收藏',
                content: ['你变成走廊上的画像，永远睁着眼。'],
                isEnding: true,
                endingNumber: 18
            },
            ending_19: {
                id: 'ending_19',
                title: '自由落体',
                content: ['你跳窗，却落进怪物的胃里。'],
                isEnding: true,
                endingNumber: 19
            },
            ending_20: {
                id: 'ending_20',
                title: '遗忘的救世主',
                content: ['你签下契约，封印怪物，但你忘了所有人。'],
                isEnding: true,
                endingNumber: 20
            },
            ending_21: {
                id: 'ending_21',
                title: '同归于尽',
                content: ['你和怪物一起烧成灰烬，只有合影留下。'],
                isEnding: true,
                endingNumber: 21
            }
        };
    },

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.isTransitioning) {
                this.toggleAudio();
            }
        });

        document.addEventListener('click', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });

        document.addEventListener('touchstart', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
    },

    startAmbientMusic() {
        if (!this.audioEnabled || !this.musicEnabled) return;

        this.ensureAudioReady().then((ready) => {
            if (!ready) return;

            this.stopAmbientMusic();

            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.ambientGain.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 3);
            this.ambientGain.connect(this.audioContext.destination);

            const drone = this.audioContext.createOscillator();
            drone.type = 'sine';
            drone.frequency.setValueAtTime(110, this.audioContext.currentTime);

            const droneGain = this.audioContext.createGain();
            droneGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            droneGain.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 2);
            drone.connect(droneGain);
            droneGain.connect(this.ambientGain);
            drone.start();

            const drone2 = this.audioContext.createOscillator();
            drone2.type = 'sine';
            drone2.frequency.setValueAtTime(165, this.audioContext.currentTime);

            const drone2Gain = this.audioContext.createGain();
            drone2Gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            drone2Gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 2.5);
            drone2.connect(drone2Gain);
            drone2Gain.connect(this.ambientGain);
            drone2.start();

            this.ambientOscillators = [drone, drone2];

            this.modulateAmbient();
            this.scheduleMelody();
        });
    },

    scheduleMelody() {
        if (!this.audioContext || !this.audioEnabled || !this.musicEnabled) return;

        const now = this.audioContext.currentTime;
        const notes = [261.63, 329.63, 349.23, 293.66, 261.63, 220, 164.81, 196];
        const noteDurations = [2, 1, 1, 2, 1, 1, 2, 2];

        notes.forEach((freq, index) => {
            setTimeout(() => {
                if (!this.audioEnabled || !this.musicEnabled) return;

                const melody = this.audioContext.createOscillator();
                melody.type = 'triangle';
                melody.frequency.setValueAtTime(freq, this.audioContext.currentTime);

                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
                gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + noteDurations[index] - 0.1);

                melody.connect(gain);
                gain.connect(this.ambientGain);
                melody.start();
                melody.stop(this.audioContext.currentTime + noteDurations[index]);

            }, 8000 + index * 1000);
        });

        setTimeout(() => {
            if (this.audioEnabled && this.musicEnabled) {
                this.scheduleMelody();
            }
        }, 20000);
    },

    modulateAmbient() {
        if (!this.ambientGain || !this.audioEnabled || !this.musicEnabled) return;

        const now = this.audioContext.currentTime;
        const baseVolume = 0.3;

        const randomVolume = baseVolume + (Math.random() - 0.5) * 0.1;
        this.ambientGain.gain.linearRampToValueAtTime(
            Math.max(0.2, Math.min(0.4, randomVolume)),
            now + 2
        );

        this.ambientOscillators.forEach((osc, i) => {
            if (osc.frequency.value) {
                const baseFreq = [110, 165][i];
                const variation = (Math.random() - 0.5) * 8;
                osc.frequency.linearRampToValueAtTime(baseFreq + variation, now + 3);
            }
        });

        setTimeout(() => {
            if (this.audioEnabled && this.musicEnabled) {
                this.modulateAmbient();
            }
        }, 3000 + Math.random() * 2000);
    },

    stopAmbientMusic() {
        this.ambientOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {}
        });
        this.ambientOscillators = [];

        if (this.ambientGain) {
            this.ambientGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
        }
    },

    pauseAmbientMusic() {
        if (this.ambientGain) {
            this.ambientGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
        }
    },

    resumeAmbientMusic() {
        if (this.ambientGain && this.audioEnabled && this.musicEnabled) {
            this.ambientGain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.5);
        }
    },

    playChoiceSound() {
        if (!this.audioEnabled || !this.musicEnabled) return;

        this.ensureAudioReady().then((ready) => {
            if (!ready) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.15);

            gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.15);
        });
    },

    playTransitionSound() {
        if (!this.audioEnabled || !this.musicEnabled) return;

        this.ensureAudioReady().then((ready) => {
            if (!ready) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.4);

            gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.4);
        });
    },

    playJumpscareSound() {
        if (!this.audioEnabled || !this.musicEnabled) return;

        this.ensureAudioReady().then((ready) => {
            if (!ready) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.08);
            oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.25);

            gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.4);
        });
    },

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const btn = document.getElementById('mute-btn');
        if (btn) {
            btn.textContent = this.audioEnabled ? '🔊' : '🔇';
        }

        if (this.audioEnabled) {
            this.startAmbientMusic();
        } else {
            this.stopAmbientMusic();
        }
    },

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled && this.audioEnabled) {
            this.startAmbientMusic();
        } else {
            this.pauseAmbientMusic();
        }
    },

    start() {
        this.ensureAudioReady().then(() => {
            this.playTransitionSound();
            this.startAmbientMusic();
            this.transitionTo('scene_1');
            this.addAtmosphereEffects();
        });
    },

    restart() {
        this.visitedScenes = [];
        this.ensureAudioReady().then(() => {
            this.playTransitionSound();
            this.transitionTo('scene_1');
        });
    },

    transitionTo(targetId) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const overlay = document.getElementById('transition-overlay');
        overlay.classList.add('active');

        setTimeout(() => {
            this.hideAllScreens();

            if (targetId.startsWith('ending_')) {
                this.showEnding(targetId);
            } else {
                this.showScene(targetId);
            }

            setTimeout(() => {
                overlay.classList.remove('active');
                this.isTransitioning = false;
            }, 400);
        }, 400);
    },

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    },

    showScene(sceneId) {
        const scene = this.scenes[sceneId];
        if (!scene) {
            console.error('Scene not found:', sceneId);
            return;
        }

        this.currentScene = sceneId;
        this.visitedScenes.push(sceneId);

        const screen = document.getElementById('scene-screen');
        const badge = document.getElementById('scene-badge');
        const title = document.getElementById('scene-title');
        const textEl = document.getElementById('scene-text');
        const choicesEl = document.getElementById('choices-container');

        badge.textContent = `场景 ${this.visitedScenes.length}`;
        title.textContent = scene.title;

        textEl.innerHTML = scene.content.map(p => `<p>${p}</p>`).join('');

        choicesEl.innerHTML = '';
        if (scene.choices && scene.choices.length > 0) {
            scene.choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = `${index + 1}. ${choice.text}`;
                btn.onclick = () => this.makeChoice(choice);
                choicesEl.appendChild(btn);
            });
        }

        screen.classList.add('active');
        this.triggerSceneEffect();
    },

    showEnding(endingId) {
        const scene = this.scenes[endingId];
        if (!scene) {
            console.error('Ending not found:', endingId);
            return;
        }

        if (!this.endingsUnlocked.includes(endingId)) {
            this.endingsUnlocked.push(endingId);
        }

        const screen = document.getElementById('ending-screen');
        const numberEl = document.getElementById('ending-number');
        const titleEl = document.getElementById('ending-title');
        const descEl = document.getElementById('ending-description');
        const countEl = document.getElementById('ending-count');

        numberEl.textContent = `结局 ${scene.endingNumber || endingId.split('_')[1]} / 21`;
        titleEl.textContent = scene.title || '未知结局';
        descEl.textContent = scene.content[0] || '';
        countEl.textContent = this.endingsUnlocked.length;

        screen.classList.add('active');

        if (scene.content[0] && (scene.content[0].includes('永远') || scene.content[0].includes('困'))) {
            this.triggerJumpscare();
        }
    },

    makeChoice(choice) {
        this.playChoiceSound();

        if (choice.isEnding || choice.target.startsWith('ending_')) {
            this.transitionTo(choice.target);
        } else if (choice.target.startsWith('scene_')) {
            this.transitionTo(choice.target);
        }
    },

    triggerSceneEffect() {
        const container = document.getElementById('game-container');
        container.classList.add('scene-active');

        const flicker = document.getElementById('screen-flicker');
        if (flicker) {
            flicker.style.opacity = '1';
            setTimeout(() => {
                flicker.style.opacity = '0';
            }, 150);
        }

        setTimeout(() => {
            container.classList.remove('scene-active');
        }, 500);
    },

    triggerJumpscare() {
        this.playJumpscareSound();

        const overlay = document.createElement('div');
        overlay.className = 'jumpscare-overlay active';
        overlay.innerHTML = '<div class="face">👻</div>';
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 100);
        }, 600);
    },

    addAtmosphereEffects() {
        if (document.querySelector('.blood-drip')) return;

        const drip = document.createElement('div');
        drip.className = 'blood-drip';
        document.body.appendChild(drip);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    game.init();
});

window.game = game;