export const CATALOG={
  source:{sheetId:'1Jk3KCLqHHzi-jxigIcPpcXZestcxb8Y0BeQLjhiezb8',gid:'0'},
  schools:[
    {id:'scds',name:'School of Computing & Data Science',short:'SCDS',years:[
      {id:'scds-2',label:'Year 2',level:2,sections:[],electives:[
        'Intelligent Embedded Systems','Emerging Tools and Applications','Fundamentals of Business Organization & Management','Forensic Psychology'
      ]},
      {id:'scds-3',label:'Year 3',level:3,sections:[],mandatory:['Deep Learning','Theory of Computation'],electives:[
        'Quantum Machine Learning','Cybersecurity: Fundamental Concepts and Management','Computer Networks','Financial Reporting and Analysis','Organizational Psychology','Computer Organization and Architecture','Human AI Interaction','Introduction to Financial Accounting','Critical Thinking','Forensic Psychology','Community Psychology','Fundamentals of Business Organization & Management','Principles in Financial Management'
      ]}
    ]},
    {id:'soai',name:'School of Artificial Intelligence',short:'SOAI',years:[
      {id:'soai-2',label:'Year 2',level:2,sections:[],mandatory:['Differential Equations','Frontiers of Machine Learning','Discrete Mathematics','Image Processing','Human AI Interaction'],electives:['Intelligent Embedded Systems','Forensic Psychology']}
    ]},
    {id:'sob',name:'School of Business',short:'SOB',years:[
      {id:'sob-2',label:'Year 2',level:2,sections:[],tracks:['BBA','B.Com'],mandatory:['Corporate and Business Law','Operations Research','Human Resource Management','Principles in Financial Management','Principles of Financial Management','Financial Reporting and Analysis']}
    ]},
    {id:'sol',name:'School of Law',short:'SOL',years:[{id:'sol-2',label:'Year 2',level:2,sections:[],sectionsOptional:true}]},
    {id:'sop',name:'School of Psychology',short:'SOP',years:[{id:'sop-2',label:'Year 2',level:2,sections:[]}]}
  ]
};
export function schoolById(id){return CATALOG.schools.find(s=>s.id===id)||CATALOG.schools[0]}
export function yearById(school,id){return (school?.years||[]).find(y=>y.id===id)||school?.years?.[0]||null}
export function sheetCsvUrl(){return `https://docs.google.com/spreadsheets/d/${CATALOG.source.sheetId}/export?format=csv&gid=${encodeURIComponent(CATALOG.source.gid)}`}
