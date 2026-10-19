import type {SystemId} from './anatomy';
import type {QuizQuestion, Source} from './content';


export type QuizGroupId =
  | 'circulation' | 'respiratory' | 'skeletal'
  | 'muscular' | 'digestive' | 'nervous'
  | 'sensory' | 'urinary' | 'endocrine' | 'lymphatic';

export interface ExpandedQuizQuestion extends QuizQuestion {
  group: QuizGroupId;
}

export interface QuizGroup {
  id: QuizGroupId;
  label: string;
  system: SystemId;
  blurb: string;
}

export const QUIZ_GROUPS: QuizGroup[] = [
  {id:'circulation', label:'循环', system:'cardiac', blurb:'心脏、血管与双循环路径'},
  {id:'respiratory', label:'呼吸', system:'respiratory', blurb:'导气通路、肺叶与呼吸动力'},
  {id:'skeletal', label:'骨骼', system:'skeletal', blurb:'中轴、附肢与骨性地标'},
  {id:'muscular', label:'肌肉', system:'muscular', blurb:'主要肌群与运动方向'},
  {id:'digestive', label:'消化', system:'digestive', blurb:'消化管顺序与附属器官'},
  {id:'nervous', label:'神经', system:'nervous', blurb:'脑区、传导束与感觉通路'},
  {id:'sensory', label:'感觉', system:'sensory', blurb:'眼的结构与屈光通路'},
  {id:'urinary', label:'泌尿', system:'urinary', blurb:'尿液的生成与排出路径'},
  {id:'endocrine', label:'内分泌', system:'endocrine', blurb:'内分泌腺与激素来源'},
  {id:'lymphatic', label:'淋巴', system:'lymphatic', blurb:'淋巴器官与免疫监视'},
];

export const EXPANDED_SOURCES:Record<string,Source>={
 circulation_vessels:{title:'OpenStax Anatomy & Physiology 2e · 20.1 Structure and Function of Blood Vessels',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/20-1-structure-and-function-of-blood-vessels',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 circulation_physiology:{title:'OpenStax Anatomy & Physiology 2e · 20.4 Physiology of Circulation',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/20-4-physiology-of-circulation',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 breathing:{title:'OpenStax Anatomy & Physiology 2e · 22.3 The Process of Breathing',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-3-the-process-of-breathing',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 gas_exchange:{title:'OpenStax Anatomy & Physiology 2e · 22.4 Gas Exchange',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-4-gas-exchange',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 skeletal_functions:{title:'OpenStax Anatomy & Physiology 2e · 6.1 The Functions of the Skeletal System',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/6-1-the-functions-of-the-skeletal-system',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 skull:{title:'OpenStax Anatomy & Physiology 2e · 7.2 The Skull',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/7-2-the-skull',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 vertebral:{title:'OpenStax Anatomy & Physiology 2e · 7.3 The Vertebral Column',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/7-3-the-vertebral-column',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 thoracic_cage:{title:'OpenStax Anatomy & Physiology 2e · 7.4 The Thoracic Cage',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/7-4-the-thoracic-cage',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 pectoral_girdle:{title:'OpenStax Anatomy & Physiology 2e · 8.1 The Pectoral Girdle',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/8-1-the-pectoral-girdle',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 upper_limb:{title:'OpenStax Anatomy & Physiology 2e · 8.2 Bones of the Upper Limb',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 lower_limb:{title:'OpenStax Anatomy & Physiology 2e · 8.4 Bones of the Lower Limb',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/8-4-bones-of-the-lower-limb',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 joints:{title:'OpenStax Anatomy & Physiology 2e · 9.1 Classification of Joints',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/9-1-classification-of-joints',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 synovial:{title:'OpenStax Anatomy & Physiology 2e · 9.4 Synovial Joints',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/9-4-synovial-joints',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 muscle_naming:{title:'OpenStax Anatomy & Physiology 2e · 11.2 Naming Skeletal Muscles',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-2-naming-skeletal-muscles',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 muscle_axial:{title:'OpenStax Anatomy & Physiology 2e · 11.3 Axial Muscles of the Head, Neck, and Back',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 muscle_upper:{title:'OpenStax Anatomy & Physiology 2e · 11.5 Muscles of the Pectoral Girdle and Upper Limbs',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 muscle_lower:{title:'OpenStax Anatomy & Physiology 2e · 11.6 Appendicular Muscles of the Pelvic Girdle and Lower Limbs',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 digestive_overview:{title:'OpenStax Anatomy & Physiology 2e · 23.1 Overview of the Digestive System',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 digestive_processes:{title:'OpenStax Anatomy & Physiology 2e · 23.2 Digestive System Processes and Regulation',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-2-digestive-system-processes-and-regulation',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 mouth_esophagus:{title:'OpenStax Anatomy & Physiology 2e · 23.3 The Mouth, Pharynx, and Esophagus',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-3-the-mouth-pharynx-and-esophagus',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 stomach:{title:'OpenStax Anatomy & Physiology 2e · 23.4 The Stomach',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 intestines:{title:'OpenStax Anatomy & Physiology 2e · 23.5 The Small and Large Intestines',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 accessory:{title:'OpenStax Anatomy & Physiology 2e · 23.6 Accessory Organs in Digestion',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 nervous_tissue:{title:'OpenStax Anatomy & Physiology 2e · 12.1 Basic Structure and Function of the Nervous System',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-1-basic-structure-and-function-of-the-nervous-system',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 cns:{title:'OpenStax Anatomy & Physiology 2e · 13.2 The Central Nervous System',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/13-2-the-central-nervous-system',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 embryologic:{title:'OpenStax Anatomy & Physiology 2e · 13.1 The Embryologic Perspective',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/13-1-the-embryologic-perspective',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 sensory_perception:{title:'OpenStax Anatomy & Physiology 2e · 14.1 Sensory Perception',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 autonomic:{title:'OpenStax Anatomy & Physiology 2e · 15.1 Divisions of the Autonomic Nervous System',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/15-1-divisions-of-the-autonomic-nervous-system',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 urine_characteristics:{title:'OpenStax Anatomy & Physiology 2e · 25.1 Physical Characteristics of Urine',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-1-physical-characteristics-of-urine',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 urine_transport:{title:'OpenStax Anatomy & Physiology 2e · 25.2 Gross Anatomy of Urine Transport',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-2-gross-anatomy-of-urine-transport',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 kidney_gross:{title:'OpenStax Anatomy & Physiology 2e · 25.3 Gross Anatomy of the Kidney',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 endocrine_overview:{title:'OpenStax Anatomy & Physiology 2e · 17.1 An Overview of the Endocrine System',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/17-1-an-overview-of-the-endocrine-system',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 pituitary:{title:'OpenStax Anatomy & Physiology 2e · 17.3 The Pituitary Gland and Hypothalamus',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/17-3-the-pituitary-gland-and-hypothalamus',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 adrenal:{title:'OpenStax Anatomy & Physiology 2e · 17.6 The Adrenal Glands',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/17-6-the-adrenal-glands',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 pineal:{title:'OpenStax Anatomy & Physiology 2e · 17.7 The Pineal Gland',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/17-7-the-pineal-gland',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 lymphatic:{title:'OpenStax Anatomy & Physiology 2e · 21.1 Anatomy of the Lymphatic and Immune Systems',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/21-1-anatomy-of-the-lymphatic-and-immune-systems',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
 innate:{title:'OpenStax Anatomy & Physiology 2e · 21.2 Barrier Defenses and the Innate Immune Response',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/21-2-barrier-defenses-and-the-innate-immune-response',accessedAt:'2026-10-18',reviewStatus:'待专业复核'},
};

const c=(id:string,group:QuizGroupId,prompt:string,options:[string,string,string,string],answer:string,explanation:string,source:string,difficulty:'基础'|'进阶'|'挑战'):ExpandedQuizQuestion=>(
  {id,group,lessonId:'circulation',type:'choice',prompt,options,answer,explanation,source,difficulty} as ExpandedQuizQuestion
);

export const EXPANDED_QUIZZES:ExpandedQuizQuestion[]=[
  c('ec01','circulation','心脏位于胸腔的哪一部分？',['纵隔','腹膜腔','胸膜腔','盆腔'],'纵隔','心脏位于胸腔的中纵隔内，被心包包裹；它不在胸膜腔，也不穿过膈肌进入腹腔。','heart','基础'),
  c('ec02','circulation','四个心腔中，壁通常最厚的是？',['右心房','左心室','右心室','左心房'],'左心室','左心室要把血液泵入主动脉并推动全身循环，面对的阻力最大，因此心肌壁最厚。右心室只把血液送到肺，负荷较小。','heart','基础'),
  c('ec03','circulation','把低氧血泵入肺动脉干的是？',['右心室','左心室','左心房','右心房'],'右心室','右心室收缩将低氧血送入肺动脉干，再分向左右肺完成气体交换。','heart','基础'),
  c('ec04','circulation','肺静脉把血液送入哪个心腔？',['左心房','右心房','右心室','左心室'],'左心房','肺静脉是"静脉"，但是把富氧血从肺带回左心房，随后进入左心室。','circulation','进阶'),
  c('ec05','circulation','上、下腔静脉汇入哪个心腔？',['左心房','右心室','右心房','左心室'],'右心房','上下腔静脉收集全身低氧血并回流至右心房，再经三尖瓣进入右心室。','circulation','基础'),
  c('ec06','circulation','下列哪一项不是动脉与静脉的主要区别依据？',['血流方向','血液是否含氧','管壁结构','管腔大小'],'血液是否含氧','动静脉首先按血流方向区分。肺动脉里是低氧血、肺静脉里是富氧血，所以"含氧量"不能作为判据。','circulation_vessels','进阶'),
  c('ec07','circulation','主动脉的第一个主要分支通常供应？',['下肢','肾','心脏自身的冠状动脉','脑'],'心脏自身的冠状动脉','冠状动脉起自主动脉根部，独立供应心肌本身；心肌并不主要靠心腔内血液供氧。','circulation_vessels','进阶'),
  c('ec08','circulation','体循环沿血液前进方向，最终汇入哪个心腔？',['右心房','左心房','右心室','左心室'],'右心房','体循环从左心室出发经主动脉到全身，最后由上下腔静脉回到右心房。','circulation','基础'),
  c('ec09','circulation','肺循环的功能性起点是？',['左心室','肺动脉','右心室','右心房'],'右心室','肺循环由右心室泵血开始，经肺动脉干到肺，再由肺静脉回到左心房。','circulation','基础'),
  c('ec10','circulation','心房与心室相比，其主要职责是？',['泵出血液到全身','储存血液','接收血液','产生血细胞'],'接收血液','心房是血液进入心脏的"接收站"，心室才是推动血液前进的泵。','heart','基础'),
  c('ec11','circulation','左右心室之间的结构是？',['室间隔','二尖瓣','房间隔','心包'],'室间隔','室间隔分隔左右心室，防止氧合血与低氧血混合；房间隔则分隔左右心房。','heart','基础'),
  c('ec12','circulation','毛细血管最有利于物质交换的结构特点是？',['管壁最厚','管腔最大','管壁极薄且血流速度慢','弹性最强'],'管壁极薄且血流速度慢','毛细血管仅由单层内皮构成，且血流速度最慢，便于氧气与营养物质扩散进出。','circulation_vessels','进阶'),
  c('ec13','circulation','血液从心室流向动脉时短暂存在的结构是？',['心室流出瓣膜（半月瓣）','静脉瓣','房室瓣','心包腔'],'心室流出瓣膜（半月瓣）','主动脉瓣与肺动脉瓣位于心室出口，心室收缩时开放，舒张时关闭防止反流。','heart','进阶'),
  c('ec14','circulation','运动时心率增加，主要意义是？',['提升单位时间血液输出量','减少心脏负荷','让血液变稀','降低血压'],'提升单位时间血液输出量','心输出量约等于心率乘每搏输出量，运动时心率上升以满足肌肉更高的氧需求。','circulation_physiology','进阶'),
  c('ec15','circulation','把血液从组织带回心脏的血管统称为？',['毛细血管','淋巴管','静脉','动脉'],'静脉','按血流方向定义，把血液带回心脏的血管是静脉；淋巴管运输的是淋巴液。','circulation_vessels','基础'),
  c('ec16','circulation','左心与右心的泵血对象分别是？',['体循环与肺循环','脑与肾','肺循环与体循环','冠脉与脑'],'体循环与肺循环','左心驱动体循环，右心驱动肺循环。这一分工是理解双循环的基础。','circulation','基础'),
  c('ec17','circulation','四肢静脉中防止血液倒流的结构是？',['静脉瓣','瓣膜缺如','房室瓣','半月瓣'],'静脉瓣','四肢静脉内的静脉瓣可防止血液因重力向下逆流；动脉通常没有这类瓣膜。','circulation_vessels','基础'),
  c('ec18','circulation','肺动脉中的血液含氧状况是？',['与空气相同','完全无氧','富氧','低氧'],'低氧','肺动脉输送的是尚未经过肺部气体交换的低氧血，这正是"动脉不一定富氧"的典型例子。','circulation','进阶'),
  c('ec19','circulation','心包的主要作用是？',['调节心率','分隔左右心','泵送血液','包裹并保护心脏'],'包裹并保护心脏','心包是包裹心脏的膜性囊袋，内部少量心包液可减少心脏搏动时的摩擦。','heart','基础'),
  c('ec20','circulation','心房收缩与心室收缩通常谁先发生？',['心房先收缩','只靠心房搏动','同时收缩','心室先收缩'],'心房先收缩','正常情况下，心房先收缩完成心室充盈，随后心室收缩把血液泵出。','heart','进阶'),
  c('ec21','circulation','主动脉相对于肺动脉干的位置是？',['主动脉位于其后下方','主动脉位于其左侧','两者完全重合','主动脉位于肺动脉干右侧（解剖方位）'],'主动脉位于肺动脉干右侧（解剖方位）','在标准解剖学姿势下，升主动脉位于肺动脉干的右侧；观察模型时可按这一空间关系定位。','heart','挑战'),
  c('ec22','circulation','为什么“肺静脉”里有富氧血却仍叫静脉？',['静脉按血流方向命名，不按含氧量','肺静脉实际是动脉','命名存在历史错误','因为它连着嘴'],'静脉按血流方向命名，不按含氧量','血管命名依据是“血流是否回到心脏”，而不是氧含量，这是整个循环系统命名的核心规则。','circulation','挑战'),
  c('ec23','circulation','为什么左心室壁比右心室壁厚？',['左心室需要克服更大的体循环阻力','右心室肌纤维更短','右心室不负责泵血','左心室容积更大'],'左心室需要克服更大的体循环阻力','体循环路径长、阻力大，左心室要产生更高的压力，因此心肌壁更厚；右心室只需把血液送到近处的肺。','heart','挑战'),
  c('ec24','circulation','舒张期时，心室内压力与心房相比大致是？',['心室内压力低于心房','完全相等','心室内压力高于心房','无法比较'],'心室内压力低于心房','心室舒张、房室瓣开放时，心房压力高于心室，血液才会被动流入心室完成充盈。','circulation_physiology','挑战'),
  c('es22','skeletal','为什么同一块骨在儿童期比成人期更容易变形而不断？',['儿童骨完全不含钙','儿童骨没有骨髓','成人骨没有骨膜','儿童骨有机成分比例高、韧性相对更大'],'儿童骨有机成分比例高、韧性相对更大','骨由有机成分与无机盐共同构成：儿童骨有机成分比例较高，因此柔韧、易变形；成人骨无机盐比例提高，更硬但更脆。','skeletal_functions','挑战'),

  c('er01','respiratory','气管下端分叉后形成什么结构？',['喉','肺静脉','肺泡','左右主支气管'],'左右主支气管','气管下端分叉形成左右主支气管，进入两肺后继续分支成支气管树。','respiratory','基础'),
  c('er02','respiratory','右肺通常分为几叶？',['三叶','两叶','一叶','五叶'],'三叶','右肺通常分上、中、下三叶；左肺通常两叶，并为心脏留出心切迹。','lungs','基础'),
  c('er03','respiratory','左侧胸腔为心脏让出空间的结构称为？',['心切迹','胸骨角','肺门','膈肌'],'心切迹','左肺前内侧面的凹陷称心切迹，用来容纳心脏，这也是左右肺不对称的主要原因。','lungs','进阶'),
  c('er04','respiratory','气体交换主要发生在？',['胸膜腔内','主支气管内','气管内','肺泡与毛细血管之间'],'肺泡与毛细血管之间','肺泡壁与毛细血管壁共同构成薄薄的呼吸膜，氧与二氧化碳在此扩散。','respiratory','基础'),
  c('er05','respiratory','吸气时膈肌与肋间外肌的配合是？',['膈肌下降、肋间外肌收缩','两者都舒张','两者都停止工作','膈肌上升、肋间外肌舒张'],'膈肌下降、肋间外肌收缩','膈肌收缩下降、肋间外肌收缩抬高肋骨，两者共同增大胸腔容积，形成吸气动力。','breathing','进阶'),
  c('er06','respiratory','胸膜腔内的压力通常是？',['低于大气压（负压）','完全真空','等于大气压','高于大气压'],'低于大气压（负压）','胸膜腔内的负压使肺贴附于胸壁、随胸腔扩张而被动扩张；一旦进气会形成气胸。','breathing','挑战'),
  c('er07','respiratory','气体在肺泡与血液间扩散，主要依据是？',['血红蛋白数量','血压高低','分压差','温度'],'分压差','气体自高分压区向低分压区扩散，肺泡与血液间的分压差是氧和二氧化碳交换的直接动力。','gas_exchange','进阶'),
  c('er08','respiratory','下列哪一项属于导气区而非呼吸区？',['肺泡','气管','肺泡管','肺泡囊'],'气管','气管、支气管只负责传导空气；真正进行气体交换的是肺泡及其相连结构组成的呼吸区。','respiratory','基础'),

  c('es01','skeletal','胸廓由下列哪组结构共同构成？',['胸椎、肋骨、胸骨','腰椎、肋骨、胸骨','颈椎、肋骨、胸骨','胸椎、锁骨、肋骨'],'胸椎、肋骨、胸骨','胸廓由胸椎、肋骨和胸骨共同组成，主要功能是保护心、肺等胸腔器官并参与呼吸运动。','thoracic_cage','基础'),
  c('es02','skeletal','脊柱按区段由上到下正确的顺序是？',['颈椎、腰椎、胸椎、骶骨、尾骨','颈椎、胸椎、腰椎、骶骨、尾骨','腰椎、胸椎、颈椎、骶骨、尾骨','胸椎、颈椎、腰椎、骶骨、尾骨'],'颈椎、胸椎、腰椎、骶骨、尾骨','脊柱自上而下依次为颈椎、胸椎、腰椎、骶骨与尾骨，这一段顺序是定位椎骨的基础。','vertebral','基础'),
  c('es03','skeletal','肩胛骨在骨骼分区中属于哪一类？',['附肢骨骼（上肢带）','颅骨','中轴骨骼','胸廓'],'附肢骨骼（上肢带）','肩胛骨与锁骨构成上肢带，属于附肢骨骼；中轴骨骼包含颅骨、脊柱和胸廓。','pectoral_girdle','基础'),
  c('es04','skeletal','与股骨远端形成膝关节的主要骨是？',['桡骨','腓骨','胫骨','尺骨'],'胫骨','股骨远端与胫骨近端构成膝关节；腓骨位于小腿外侧，基本不参与膝关节的负重界面。','lower_limb','进阶'),
  c('es05','skeletal','前臂两根骨中，靠近小指侧的是？',['肱骨','尺骨','桡骨','腕骨'],'尺骨','解剖学姿势下桡骨在拇指侧，尺骨靠近小指侧。尺骨近端还与肱骨构成肘关节。','upper_limb','基础'),
  c('es06','skeletal','骨髓的主要功能之一是？',['产生血细胞','分泌激素','传导神经冲动','过滤尿液'],'产生血细胞','红骨髓负责造血，是骨骼系统与血液系统之间的重要连接点。','skeletal_functions','基础'),
  c('es07','skeletal','颅骨中围成颅腔、保护脑的部分属于？',['脑颅','面颅','下颌骨','舌骨'],'脑颅','脑颅骨围成颅腔保护脑；面颅骨主要构成面部框架；舌骨不属于脑颅。','skull','基础'),
  c('es08','skeletal','下列关节中属于滑膜关节的是？',['耻骨联合','颅骨缝','椎间盘连接','膝关节'],'膝关节','滑膜关节有关节腔和滑液，活动度较大；颅骨缝属于不动关节，耻骨联合属于软骨连接。','synovial','进阶'),
  c('es09','skeletal','脊柱中数量最多的一段是？',['颈椎（7 块）','腰椎（5 块）','骶骨（1 块）','胸椎（12 块）'],'胸椎（12 块）','成人脊柱中胸椎有 12 块，是数量最多的一段；颈椎 7 块、腰椎 5 块。','vertebral','进阶'),
  c('es10','skeletal','肋骨与胸骨之间通过什么连接？',['关节腔','骨性融合','肋软骨','韧带直接连接'],'肋软骨','真肋通过自己的肋软骨直接连到胸骨，因此胸部受压时仍保有一定弹性。','thoracic_cage','进阶'),
  c('es11','skeletal','人体最长的骨通常是？',['胫骨','肱骨','股骨','肱骨与股骨等长'],'股骨','股骨是人体最长的骨，同时承担大腿的承重与有力肌群的附着。','lower_limb','基础'),
  c('es12','skeletal','骨骼系统不具有下列哪项功能？',['保护内脏','直接进行气体交换','支持与承重','作为肌肉附着点'],'直接进行气体交换','气体交换由呼吸系统完成；骨骼提供支撑、保护与肌肉杠杆。','skeletal_functions','基础'),
  c('es13','skeletal','骨盆在功能上的一个重要特点是？',['分泌消化酶','直接参与呼吸','传递上身体重到下肢','产生红细胞激素'],'传递上身体重到下肢','骨盆连接躯干与下肢，是承重传递的关键环节，也保护盆腔器官。','lower_limb','进阶'),
  c('es14','skeletal','尺骨的哪一端参与构成肘关节？',['只有中部','近端','远端','两端都不参与'],'近端','尺骨近端形成突出的鹰嘴，与肱骨滑车构成肘关节；桡骨主要负责前臂旋转。','upper_limb','挑战'),
  c('es15','skeletal','"中轴骨骼"与"附肢骨骼"的分界线在于？',['是否含红骨髓','骨的长度','是否成对','是否位于身体中央轴线'],'是否位于身体中央轴线','中轴骨骼包含颅骨、脊柱与胸廓；附肢骨骼包含上下肢及其带骨。分类依据是位置而非形态。','skeletal_functions','进阶'),
  c('es16','skeletal','胸骨在胸廓中的位置是？',['右侧缘','前方正中线','后方正中线','左侧缘'],'前方正中线','胸骨位于胸前正中线，与肋软骨构成胸廓的前壁，是心肺复苏按压的重要体表标志。','thoracic_cage','基础'),
  c('es17','skeletal','下列哪块骨属于附肢骨骼？',['椎骨','锁骨','肋骨','胸骨'],'锁骨','锁骨与肩胛骨共同构成上肢带，属于附肢骨骼；其余三项属于中轴骨骼。','pectoral_girdle','基础'),
  c('es18','skeletal','成人有多少块颈椎？',['8','5','12','7'],'7','成人颈椎共 7 块，其中第一、二颈椎（寰椎、枢椎）结构特殊，支持头部旋转。','vertebral','基础'),
  c('es19','skeletal','为什么长骨骨干内部常中空成髓腔？',['减轻重量并容纳骨髓','方便神经穿过','增加骨密度','便于关节活动'],'减轻重量并容纳骨髓','长骨中空的髓腔既减轻骨骼重量，又容纳造血与储脂的红骨髓、黄骨髓。','skeletal_functions','进阶'),
  c('es20','skeletal','肩关节活动范围大但稳定性较低，主要原因是？',['关节窝浅、周围韧带相对松弛','完全没有关节囊','没有肌肉附着','关节窝很深'],'关节窝浅、周围韧带相对松弛','肩关节的关节窝浅，主要依靠肌肉与韧带维持稳定，因此活动度大但更易脱位。','synovial','挑战'),
  c('es21','skeletal','下列哪一项不是中轴骨骼的组成？',['胸骨','椎骨','肩胛骨','颅骨'],'肩胛骨','肩胛骨属于上肢带、即附肢骨骼；颅骨、胸骨与椎骨都位于身体中轴。','skeletal_functions','基础'),

  c('em01','muscular','膈肌收缩时主要产生什么动作？',['伸膝','呼气','屈肘','吸气'],'吸气','膈肌是主要的吸气肌，收缩时向腹腔方向下降，增大胸腔容积。','muscle_axial','基础'),
  c('em02','muscular','胸锁乳突肌单侧收缩时，主要使头？',['完全不动','向同侧旋转并后仰','转向对侧并侧屈同侧','向前屈曲'],'转向对侧并侧屈同侧','胸锁乳突肌一侧收缩可使头转向对侧、向同侧侧屈，是颈部定位的重要肌肉。','muscle_axial','进阶'),
  c('em03','muscular','负责屈肘的主要肌肉是？',['肱二头肌','肱三头肌','胸大肌','三角肌'],'肱二头肌','肱二头肌收缩屈肘并使前臂旋后；肱三头肌则是伸肘的主要肌肉。','muscle_upper','基础'),
  c('em04','muscular','伸膝动作主要由哪组肌肉完成？',['腘绳肌','股四头肌','小腿三头肌','臀大肌'],'股四头肌','股四头肌位于大腿前面，是膝关节伸展的主力；腘绳肌位于后方，主要负责屈膝。','muscle_lower','基础'),
  c('em05','muscular','三角肌的主要作用是？',['伸肘','屈肩并内收','屈髋','外展肩关节'],'外展肩关节','三角肌包绕肩部，中部纤维收缩可使上臂外展；前、后部纤维分别参与前屈与后伸。','muscle_upper','基础'),
  c('em06','muscular','腹外斜肌纤维的走向大致是？',['环形','水平横向','外上内下（斜向下内侧）','垂直上下'],'外上内下（斜向下内侧）','腹外斜肌纤维自外上走向内下，像双手插兜的方向，与腹内斜肌几乎垂直交叉。','muscle_axial','进阶'),
  c('em07','muscular','下列哪块肌肉位于小腿后群？',['前锯肌','斜方肌','股外侧肌','腓肠肌'],'腓肠肌','腓肠肌位于小腿后方，是使足跖屈的主要肌肉之一；其余三块分别位于大腿、胸侧与背部。','muscle_lower','基础'),
  c('em08','muscular','原动肌与拮抗肌的关系是？',['总是同时收缩','完全无关','方向相反、相互制约','方向相同、协同用力'],'方向相反、相互制约','原动肌产生目标动作，拮抗肌位于相反方向起制动与精细控制作用，二者并非"对抗"的敌人。','muscle_naming','进阶'),
  c('em09','muscular','为什么肌肉常以"起点—止点"描述？',['止点一定在近端','这是纯命名习惯','便于说明其收缩时会拉动哪一端','起点一定比止点更重要'],'便于说明其收缩时会拉动哪一端','肌肉收缩时通常拉动较固定的起点、带动活动度较大的止点，这是描述动作的基础。','muscle_naming','进阶'),
  c('em10','muscular','前锯肌的一个重要功能是？',['伸髋','使肩胛骨前伸并贴紧胸壁','闭合声门','屈曲肘关节'],'使肩胛骨前伸并贴紧胸壁','前锯肌把肩胛骨拉向胸壁，其功能受损时可出现"翼状肩胛"。','muscle_upper','挑战'),

  c('ed01','digestive','食物从口进入后，依次经过的管道顺序是？',['食管→胃→十二指肠→空肠→回肠→结肠','食管→十二指肠→胃→回肠→空肠→结肠','胃→食管→十二指肠→结肠→回肠','食管→胃→回肠→空肠→十二指肠→结肠'],'食管→胃→十二指肠→空肠→回肠→结肠','消化管顺序是食管、胃、小肠（十二指肠、空肠、回肠）、大肠（盲肠、结肠、直肠）。这个顺序是理解整个章节的骨架。','digestive_overview','基础'),
  c('ed02','digestive','下列哪一项属于消化系统的附属器官？',['十二指肠','食管','胃','胰'],'胰','胰腺、肝、胆囊属于附属器官，分泌消化液或储存胆汁但不直接位于消化管中。','accessory','基础'),
  c('ed03','digestive','小肠中承担主要吸收功能的区段特征是？',['完全没有血液供应','黏膜面积被皱襞、绒毛和微绒毛极大扩展','只负责储存食物','管壁极薄无任何褶皱'],'黏膜面积被皱襞、绒毛和微绒毛极大扩展','小肠通过三级放大结构把吸收面积提升到极大，是营养吸收的主力场所。','intestines','进阶'),
  c('ed04','digestive','胆汁主要由哪个器官产生？',['胰','肝','胃','胆囊'],'肝','肝细胞持续产生胆汁，胆囊负责储存与浓缩，并在进食时排出帮助脂肪乳化。','accessory','基础'),
  c('ed05','digestive','胃内盐酸的重要作用之一是？',['中和胆汁','激活胃蛋白酶并杀灭部分细菌','分泌胰岛素','直接吸收葡萄糖'],'激活胃蛋白酶并杀灭部分细菌','胃酸提供低 pH 环境，既激活胃蛋白酶原，也抑制部分随食物进入的微生物。','stomach','进阶'),
  c('ed06','digestive','大肠中吸收的主要物质是？',['脂肪','蛋白质','纤维素','水和电解质'],'水和电解质','大肠主要回收水分与电解质并形成粪便；纤维素不被人体消化吸收，但有助于形成粪便体积。','intestines','基础'),
  c('ed07','digestive','胰腺分泌的消化酶主要进入？',['结肠','十二指肠','胃','食管'],'十二指肠','胰管将胰液送入十二指肠，其中的酶在小肠内参与三大营养物质的化学性消化。','accessory','基础'),
  c('ed08','digestive','食管的主要功能是？',['混合食物与胃酸','把食团从咽运送到胃','吸收营养物质','储存食物'],'把食团从咽运送到胃','食管通过蠕动把食团送入胃；吸收与混合主要发生在小肠和胃。','mouth_esophagus','基础'),
  c('ed09','digestive','咀嚼属于消化过程中的哪一类？',['吸收','化学性消化','排泄','机械性消化'],'机械性消化','咀嚼和胃肠蠕动属于机械性消化，把食物变小并与消化液混合；酶的作用属于化学性消化。','digestive_processes','基础'),
  c('ed10','digestive','阑尾位于下列哪个部位附近？',['食管','十二指肠','胃','盲肠'],'盲肠','阑尾附着于盲肠，位于右下腹；它的位置和附着点是判断相关症状的重要解剖依据。','intestines','进阶'),
  c('ed11','digestive','结肠按食物残渣前进方向，正确的顺序是？',['横结肠→升结肠→降结肠','降结肠→横结肠→升结肠','升结肠→降结肠→横结肠','升结肠→横结肠→降结肠'],'升结肠→横结肠→降结肠','食物残渣从盲肠进入升结肠，横向经过横结肠，再沿降结肠向下到直肠，形成顺时针的“大问号”。','intestines','进阶'),
  c('ed12','digestive','胰的“双重身份”指的是？',['既能吸收又能排泄','既属于消化系统又属于呼吸系统','同时属于胃和小肠','同时具有外分泌（消化酶）与内分泌（激素）功能'],'同时具有外分泌（消化酶）与内分泌（激素）功能','胰的外分泌部分泌含酶的胰液进十二指肠；内分泌部的胰岛则分泌胰岛素、胰高血糖素入血。','accessory','挑战'),

  c('en01','nervous','人体最大、最复杂的脑部分区是？',['大脑（端脑）','脑桥','延髓','小脑'],'大脑（端脑）','大脑承担高级认知、语言、运动控制等功能，是神经系统中最复杂的一部分。','cns','基础'),
  c('en02','nervous','小脑的主要功能偏向？',['过滤血液','语言理解','协调运动与维持平衡','分泌激素'],'协调运动与维持平衡','小脑不直接发动动作，而是与大脑皮层、脑干协作，修正动作的协调和平衡。','cns','基础'),
  c('en03','nervous','延髓承载的重要功能是？',['视觉成像','高级语言处理','调节呼吸、心跳等基本生命活动','储存长期记忆'],'调节呼吸、心跳等基本生命活动','延髓是脑干下段，包含多种生命中枢，所以损伤风险极高。','cns','进阶'),
  c('en04','nervous','连接左右大脑半球的巨大白质束是？',['胼胝体','内囊','脑桥','视交叉'],'胼胝体','胼胝体由大量交叉纤维组成，是两半球之间信息交换的高速通道。','cns','进阶'),
  c('en05','nervous','视神经在进入脑之前于何处部分交叉？',['胼胝体','脑桥','延髓','视交叉'],'视交叉','两侧视神经在视交叉处部分纤维交叉，使左右视野的信息随后被分配到相应的视觉通路。','sensory_perception','进阶'),
  c('en06','nervous','自主神经系统主要调控？',['随意骨骼肌','听力','不随意的心肌、平滑肌与腺体','语言'],'不随意的心肌、平滑肌与腺体','自主神经系统（交感与副交感）调控内脏活动，而随意运动由躯体运动系统完成。','autonomic','基础'),
  c('en07','nervous','脑干自上而下的三段顺序是？',['延髓、脑桥、中脑','中脑、延髓、脑桥','脑桥、中脑、延髓','中脑、脑桥、延髓'],'中脑、脑桥、延髓','脑干自上而下依次为中脑、脑桥、延髓，向下延续为脊髓。这一顺序有助于在模型上逐段定位。','cns','进阶'),
  c('en08','nervous','神经元与神经胶质细胞相比，承担信号传递的是？',['小胶质细胞','少突胶质细胞','神经元','星形胶质细胞'],'神经元','神经元负责产生和传导电信号，胶质细胞则提供支持、绝缘与代谢保障，不直接传递动作电位。','nervous_tissue','进阶'),

  c('ea01','sensory','眼球中负责聚焦光线的主要折射面是？',['巩膜','视网膜','角膜','脉络膜'],'角膜','角膜提供最大的固定折射力，晶状体则通过改变曲度实现动态调焦。','sensory_perception','进阶'),
  c('ea02','sensory','调节进入眼内光量的是？',['角膜','晶状体','视网膜','虹膜'],'虹膜','虹膜是瞳孔周围的有色肌肉环，通过调整瞳孔大小控制进光量。','sensory_perception','基础'),
  c('ea03','sensory','感光细胞通常位于眼球的哪层？',['晶状体','视网膜','角膜','玻璃体'],'视网膜','视杆与视锥细胞位于视网膜内，把光信号转换为神经信号再经视神经传入。','sensory_perception','基础'),
  c('ea04','sensory','晶状体改变曲度依靠的是？',['眼球整体移动','角膜厚度的变化','睫状肌的收缩与舒张','瞳孔大小的变化'],'睫状肌的收缩与舒张','睫状肌通过牵动悬韧带调节晶状体曲度，实现看近看远的对焦（调节）。','sensory_perception','挑战'),
  c('ea05','sensory','玻璃体在眼球中的位置与作用是？',['位于巩膜内，分泌泪液','位于晶状体后方，维持眼球形状','位于视网膜外层，感光','位于角膜前方，折射光线'],'位于晶状体后方，维持眼球形状','玻璃体是填充在晶状体后方的大块透明胶状物，对维持眼球形态和支撑视网膜有重要作用。','sensory_perception','基础'),

  c('eu01','urinary','尿液从肾到体外的正确路径是？',['肾→尿道→膀胱→输尿管','肾→输尿管→膀胱→尿道','膀胱→肾→输尿管→尿道','肾→膀胱→输尿管→尿道'],'肾→输尿管→膀胱→尿道','肾生成尿液后经左右输尿管到达膀胱储存，最后经尿道排出。','urine_transport','基础'),
  c('eu02','urinary','肾脏在泌尿系统中最核心的功能是？',['储存尿液','分泌消化酶','过滤血液并调节体液成分','把尿液排出体外'],'过滤血液并调节体液成分','肾通过滤过、重吸收与分泌生成尿液，同时调节水、电解质与酸碱平衡。','kidney_gross','基础'),
  c('eu03','urinary','膀胱储存尿液主要依靠哪类结构？',['心肌与瓣膜','骨骼肌与关节','韧带与软骨','平滑肌与括约肌系统'],'平滑肌与括约肌系统','膀胱壁的逼尿肌和平滑肌配合内外括约肌，实现储存与排尿之间的控制。','urine_transport','进阶'),
  c('eu04','urinary','下列哪项不是肾脏的调节功能？',['直接分泌胰液','调节红细胞生成','调节血压','调节酸碱平衡'],'直接分泌胰液','胰液由胰腺分泌；肾脏参与血压、酸碱与红细胞生成（通过促红细胞生成素）的调节。','kidney_gross','挑战'),

  c('ee01','endocrine','内分泌系统与神经系统的核心区别之一是？',['内分泌信号经血液传播，作用较慢而持久','内分泌信号必须靠突触传递','内分泌只作用于同一器官','内分泌不依赖任何化学物质'],'内分泌信号经血液传播，作用较慢而持久','内分泌激素随血液到达远处靶器官，作用起效较慢但持续时间更长；神经信号则快速、局部。','endocrine_overview','进阶'),
  c('ee02','endocrine','垂体位于脑的什么位置？',['小脑后方','大脑表面','延髓内部','蝶鞍内、下丘脑下方'],'蝶鞍内、下丘脑下方','垂体位于蝶鞍内，借垂体柄与下丘脑相连，是许多内分泌调节的上游中枢。','pituitary','基础'),
  c('ee03','endocrine','松果体分泌的褪黑素主要参与？',['调节血糖','控制体温','促进消化','调节昼夜节律'],'调节昼夜节律','松果体分泌褪黑素，其分泌随光照变化而波动，参与调节睡眠—觉醒的昼夜节律。','pineal','进阶'),
  c('ee04','endocrine','肾上腺位于人体的哪个位置？',['胰腺上方','胃上方','心脏上方','肾脏上方'],'肾脏上方','肾上腺成对位于左右肾的上方，属于内分泌腺，与肾本体的泌尿功能是两回事。','adrenal','基础'),

  c('el01','lymphatic','脾脏在免疫系统中的主要作用之一是？',['过滤血液并清除衰老红细胞','储存胆汁','产生胰岛素','分泌消化酶'],'过滤血液并清除衰老红细胞','脾是重要的淋巴器官，负责过滤血液、清除老化红细胞并参与免疫应答。','lymphatic','基础'),
  c('el02','lymphatic','胸腺在人体生命周期中的典型变化是？',['青春期后逐渐退化、被脂肪组织替代','出生时不存在','从不发生变化','老年时体积最大'],'青春期后逐渐退化、被脂肪组织替代','胸腺在儿童期活跃，是 T 细胞成熟的重要场所，青春期后逐渐萎缩并被脂肪替代。','lymphatic','进阶'),
  c('el03','lymphatic','淋巴系统与心血管系统的一个关键联系是？',['把组织液回收并送回血液循环','分泌胆汁','直接泵出血液到主动脉','参与呼吸气体交换'],'把组织液回收并送回血液循环','淋巴管回收组织间隙中多余的液体，最终导入锁骨下静脉，重新加入血液循环。','innate','挑战'),
];

export const EXPANDED_TOTAL = EXPANDED_QUIZZES.length;
