export const site = {
  name: 'Achievement with AI',
  url: 'https://achievementwithai.com',
  repository: 'https://github.com/AllstarProductionsLLC/achievementwithai.com',
  description: 'Discover what people are achieving with artificial intelligence. Independent discoveries, open projects, and useful ideas across creativity, science, robotics, and everyday life.'
};
export const topics = [
  {id:'creativity',name:'Art & creativity',short:'Creativity',color:'#7653c4',symbol:'✳',description:'New tools for seeing, making, and telling stories.',keywords:['image','art','creative','creativity','design','video','film','veo','imagen','diffusion','banana']},
  {id:'robotics',name:'Robotics',short:'Robotics',color:'#bf4b24',symbol:'⊞',description:'Intelligence takes a step into the physical world.',keywords:['robot','robotics','embodied','physical ai','humanoid','lerobot','manipulation']},
  {id:'music',name:'Music & sound',short:'Music',color:'#246258',symbol:'≋',description:'Fresh instruments for a very human form of expression.',keywords:['music','audio','sound','lyria','song','magenta','voice','speech']},
  {id:'gaming',name:'Gaming & worlds',short:'Gaming',color:'#7d528c',symbol:'⌘',description:'Playable worlds, learning agents, and new ways to play.',keywords:['game','gaming','games','genie','sima','eve online','atari','virtual world']},
  {id:'education',name:'Learning & education',short:'Education',color:'#276bb0',symbol:'↗',description:'Better questions. New skills. More people able to learn.',keywords:['education','learning platform','student','teacher','classroom','khan','tutor','course','saathi']},
  {id:'science',name:'Science & discovery',short:'Science',color:'#325cc5',symbol:'∴',description:'From molecules to weather, a wider lens on our world.',keywords:['science','scientific','protein','weather','alphafold','climate','biology','discovery','health','cyclone','genesis','research breakthrough']},
  {id:'finance',name:'Finance & business',short:'Finance',color:'#626524',symbol:'∑',description:'Research and tools for understanding financial systems.',keywords:['finance','financial','trading','bank','economics','business','enterprise','market','investment']},
  {id:'agents',name:'Agents & building',short:'Agents',color:'#be4a34',symbol:'⌁',description:'Useful software that turns an idea into something you can try.',keywords:['agent','coding','code','developer','programming','workflow','github','tool','open source','open-source']},
  {id:'frontier',name:'AI frontier',short:'Frontier',color:'#3551dd',symbol:'◎',description:'Models, research, and the bigger questions shaping AI.',keywords:[]}
];
export const sources = [
  {id:'openai',name:'OpenAI',url:'https://openai.com/news/rss.xml',site:'https://openai.com/news/',type:'Primary source',aiOnly:true},
  {id:'deepmind',name:'Google DeepMind',url:'https://deepmind.google/blog/rss.xml',site:'https://deepmind.google/blog/',type:'Primary source',aiOnly:true},
  {id:'huggingface',name:'Hugging Face',url:'https://huggingface.co/blog/feed.xml',site:'https://huggingface.co/blog',type:'Open community',aiOnly:true},
  {id:'nvidia',name:'NVIDIA',url:'https://blogs.nvidia.com/feed/',site:'https://blogs.nvidia.com/',type:'Primary source',aiOnly:false},
  {id:'mit',name:'MIT News',url:'https://news.mit.edu/rss/topic/artificial-intelligence2',site:'https://news.mit.edu/topic/artificial-intelligence2',type:'Research reporting',aiOnly:true}
];
export const topicById = (id) => topics.find(t=>t.id===id) || topics.at(-1);
