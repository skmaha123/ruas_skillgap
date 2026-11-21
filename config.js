/* ============================================================
 *  RUAS Skill Gap Dashboard — SETTINGS & SKILL LIBRARY
 *  Edit this file on GitHub (pencil icon) to customise.
 * ============================================================ */
window.SG_CONFIG = {
  university: "Ramaiah University of Applied Sciences",
  department: "Directorate of Training and Placement",
  title: "Skill Gap & Training Intelligence Dashboard",

  // Put the official RUAS logo in the repository as logo.png and it will appear in the header.
  logo: "logo.png",

  // Match % thresholds for readiness bands
  readyAt: 70,       // ≥ 70%  → Placement ready
  nearReadyAt: 50,   // 50–69% → Near ready; below → Needs training

  /* ---------- Domains: indicative market info + UG/PG training tracks ----------
   * demand / salary are indicative values for guidance — update every season. */
  domains: {
    "Software Development": { demand: "High", salary: "₹5L – ₹20L",
      UG: ["DSA", "Web Development", "Git & GitHub"], PG: ["System Design", "Cloud", "DevOps"],
      strategy: "Strengthen DSA, build 2–3 full-stack projects, practise coding tests." },
    "AI / Machine Learning": { demand: "Very High", salary: "₹10L – ₹45L",
      UG: ["Python", "ML Basics", "Data Handling"], PG: ["Deep Learning", "NLP", "MLOps", "Research"],
      strategy: "Focus on Python, end-to-end ML projects and internships." },
    "Data Science & Analytics": { demand: "High", salary: "₹6L – ₹25L",
      UG: ["Python", "Excel", "SQL"], PG: ["Big Data", "AI Models", "Visualization"],
      strategy: "Strengthen SQL, statistics, dashboards and case-study projects." },
    "Cloud & DevOps": { demand: "High", salary: "₹6L – ₹22L",
      UG: ["Linux", "Networking basics", "One cloud platform"], PG: ["Kubernetes", "Infrastructure as Code", "SRE"],
      strategy: "Earn one cloud associate certification and deploy real projects." },
    "Cybersecurity": { demand: "High", salary: "₹5L – ₹20L",
      UG: ["Networking", "Linux", "Security fundamentals"], PG: ["Penetration testing", "Cloud security", "SOC operations"],
      strategy: "Hands-on labs (CTFs), networking depth and a security certification." },
    "Electronics, Embedded & VLSI": { demand: "High", salary: "₹4L – ₹18L",
      UG: ["Embedded C", "Microcontrollers", "Digital electronics"], PG: ["VLSI design flow", "RTOS", "Verification"],
      strategy: "Build hardware projects; learn Verilog/embedded C with lab practice." },
    "Mechanical & Core Engineering": { demand: "Moderate", salary: "₹3L – ₹12L",
      UG: ["CAD", "Core concepts", "Internships"], PG: ["Simulation (FEA/CFD)", "Industry projects", "Research"],
      strategy: "Build core fundamentals, CAD/CAE skills and internship exposure." },
    "Civil & Construction": { demand: "Moderate", salary: "₹3L – ₹10L",
      UG: ["AutoCAD", "Estimation & costing", "Site practice"], PG: ["BIM", "Structural analysis software", "Project management"],
      strategy: "Learn BIM/structural tools and gain site/internship experience." },
    "Electrical & Power": { demand: "Moderate", salary: "₹3L – ₹12L",
      UG: ["Electrical machines", "Power systems", "MATLAB"], PG: ["Power electronics", "EV systems", "Smart grid"],
      strategy: "Strengthen core electrical concepts and EV/power-electronics projects." },
    "General / Professional": { demand: "Moderate", salary: "₹3L – ₹10L",
      UG: ["Communication", "Aptitude", "MS Office"], PG: ["Leadership", "Business communication", "Project management"],
      strategy: "Build aptitude, communication and one domain specialisation." },
  },

  /* ---------- Skill library ----------
   * [ "Skill name", ["search words / aliases"], "Training module", hours ]
   * Add a row to teach the dashboard a new skill. Aliases are matched as whole words, case-insensitive. */
  skills: {
    "Software Development": [
      ["Java", ["java", "core java", "j2ee", "spring boot"], "Java & Spring Boot Programming", 30],
      ["C++", ["c++", "cpp"], "C++ Programming & OOP", 24],
      ["C Programming", ["c programming", "c language", "programming in c"], "C Programming Fundamentals", 20],
      ["JavaScript", ["javascript", "js", "es6", "typescript"], "Modern JavaScript / TypeScript", 24],
      ["Data Structures & Algorithms", ["data structures", "algorithms", "dsa", "problem solving", "competitive programming", "leetcode"], "DSA & Coding Test Bootcamp", 40],
      ["OOP", ["oop", "oops", "object oriented", "object-oriented"], "Object-Oriented Design", 12],
      ["Web Development", ["html", "css", "web development", "frontend", "front-end", "full stack", "full-stack"], "Full-Stack Web Development", 40],
      ["React", ["react", "reactjs", "react.js", "angular", "vue"], "React Front-End Development", 24],
      ["Node.js", ["node", "node.js", "nodejs", "express"], "Node.js Back-End Development", 20],
      ["REST APIs", ["rest api", "rest apis", "restful", "api", "apis", "microservices"], "REST API & Microservices", 12],
      ["Git", ["git", "github", "gitlab", "version control"], "Git & GitHub Workflow", 6],
      ["Software Testing", ["testing", "unit testing", "selenium", "test automation", "qa"], "Software Testing & Automation", 16],
      ["Agile", ["agile", "scrum", "jira"], "Agile & Scrum Practices", 6],
      ["Operating Systems", ["operating systems", "operating system", "os concepts"], "OS Concepts for Interviews", 10],
      ["DBMS", ["dbms", "database", "databases", "mysql", "postgresql", "mongodb", "nosql", "oracle"], "Database Management Systems", 16],
      ["System Design", ["system design", "low level design", "high level design", "design patterns"], "System Design Fundamentals", 20],
    ],
    "AI / Machine Learning": [
      ["Python", ["python"], "Python Programming Bootcamp", 24],
      ["Machine Learning", ["machine learning", "ml", "scikit-learn", "sklearn", "supervised learning", "unsupervised learning"], "Applied Machine Learning", 36],
      ["Deep Learning", ["deep learning", "neural network", "neural networks", "cnn", "rnn", "tensorflow", "pytorch", "keras"], "Deep Learning with PyTorch/TensorFlow", 36],
      ["NLP", ["nlp", "natural language processing", "text mining", "transformer models", "hugging face"], "Natural Language Processing", 24],
      ["Generative AI", ["generative ai", "genai", "llm", "llms", "large language model", "prompt engineering", "rag"], "Generative AI & LLM Applications", 20],
      ["Computer Vision", ["computer vision", "opencv", "image processing", "object detection"], "Computer Vision", 24],
      ["MLOps", ["mlops", "model deployment", "mlflow"], "MLOps & Model Deployment", 16],
    ],
    "Data Science & Analytics": [
      ["SQL", ["sql", "queries", "joins"], "SQL for Data Analysis", 20],
      ["Excel", ["excel", "spreadsheets", "pivot tables", "vlookup"], "Advanced Excel", 12],
      ["Statistics", ["statistics", "statistical", "probability", "hypothesis testing"], "Statistics for Data Science", 20],
      ["Data Visualization", ["data visualization", "visualisation", "visualization", "dashboards", "dashboard"], "Data Visualisation & Storytelling", 12],
      ["Power BI / Tableau", ["power bi", "powerbi", "tableau", "looker"], "Power BI / Tableau Dashboards", 16],
      ["Pandas & NumPy", ["pandas", "numpy", "data analysis", "data cleaning", "data wrangling"], "Data Analysis with Pandas", 16],
      ["R Programming", ["r programming", "rstudio", "r language"], "R for Data Analysis", 16],
      ["Big Data", ["big data", "hadoop", "spark", "pyspark", "databricks"], "Big Data with Spark", 24],
    ],
    "Cloud & DevOps": [
      ["AWS", ["aws", "amazon web services", "ec2", "s3"], "AWS Cloud Practitioner/Associate", 24],
      ["Azure", ["azure", "microsoft azure"], "Microsoft Azure Fundamentals", 20],
      ["Google Cloud", ["gcp", "google cloud"], "Google Cloud Fundamentals", 20],
      ["Linux", ["linux", "unix", "shell scripting", "bash"], "Linux & Shell Scripting", 16],
      ["Docker", ["docker", "containers", "containerization"], "Docker & Containers", 12],
      ["Kubernetes", ["kubernetes", "k8s"], "Kubernetes Essentials", 16],
      ["CI/CD", ["ci/cd", "cicd", "jenkins", "github actions", "devops"], "CI/CD & DevOps Pipelines", 16],
      ["Terraform", ["terraform", "infrastructure as code", "ansible"], "Infrastructure as Code", 12],
    ],
    "Cybersecurity": [
      ["Network Security", ["network security", "firewall", "firewalls", "ids", "ips", "vpn"], "Network Security Fundamentals", 20],
      ["Ethical Hacking", ["ethical hacking", "penetration testing", "pentesting", "vapt", "kali"], "Ethical Hacking & VAPT", 30],
      ["Networking", ["networking", "tcp/ip", "ccna", "routing", "switching"], "Computer Networking (CCNA level)", 24],
      ["SIEM / SOC", ["siem", "soc", "splunk", "incident response"], "SOC Analyst & SIEM Tools", 20],
      ["Cryptography", ["cryptography", "encryption", "pki"], "Applied Cryptography", 12],
    ],
    "Electronics, Embedded & VLSI": [
      ["Embedded C", ["embedded c", "embedded systems", "embedded"], "Embedded C & Systems", 30],
      ["Microcontrollers", ["microcontroller", "microcontrollers", "arduino", "arm", "stm32", "8051", "raspberry pi"], "Microcontroller Programming", 24],
      ["RTOS", ["rtos", "freertos", "real-time operating system"], "RTOS Fundamentals", 16],
      ["Verilog / VHDL", ["verilog", "vhdl", "systemverilog", "rtl"], "Verilog/VHDL & RTL Design", 30],
      ["VLSI", ["vlsi", "asic", "fpga", "physical design", "uvm"], "VLSI Design Flow", 30],
      ["PCB Design", ["pcb", "pcb design", "altium", "kicad", "orcad"], "PCB Design", 16],
      ["IoT", ["iot", "internet of things", "sensors", "mqtt"], "IoT Systems & Sensors", 20],
      ["Digital Electronics", ["digital electronics", "digital circuits", "analog electronics", "circuit design"], "Digital & Analog Electronics Refresher", 16],
    ],
    "Mechanical & Core Engineering": [
      ["CAD", ["cad", "autocad", "solidworks", "catia", "creo", "nx", "fusion 360"], "3D CAD Modelling (SolidWorks/CATIA)", 30],
      ["FEA / CAE", ["fea", "finite element", "ansys", "abaqus", "hypermesh", "cae"], "FEA with ANSYS", 24],
      ["CFD", ["cfd", "computational fluid dynamics", "fluent"], "CFD Fundamentals", 20],
      ["GD&T", ["gd&t", "gdt", "geometric dimensioning", "tolerancing"], "GD&T & Engineering Drawing", 12],
      ["Manufacturing", ["manufacturing", "cnc", "machining", "lean manufacturing", "six sigma"], "Manufacturing & Lean Six Sigma", 20],
      ["Thermal Engineering", ["thermodynamics", "heat transfer", "hvac", "thermal"], "Thermal & HVAC Engineering", 16],
      ["MATLAB / Simulink", ["matlab", "simulink"], "MATLAB & Simulink", 16],
      ["Automotive", ["automotive", "vehicle dynamics", "powertrain", "ev", "electric vehicle"], "Automotive & EV Technology", 20],
      ["Robotics", ["robotics", "ros", "industrial automation", "plc", "scada"], "Robotics & Industrial Automation", 24],
    ],
    "Civil & Construction": [
      ["Structural Analysis", ["structural analysis", "staad", "staad pro", "etabs", "sap2000"], "Structural Analysis Software (STAAD/ETABS)", 24],
      ["BIM", ["bim", "revit", "navisworks"], "BIM with Revit", 24],
      ["Estimation & Costing", ["estimation", "costing", "quantity surveying", "boq"], "Estimation, Costing & QS", 16],
      ["Surveying", ["surveying", "total station", "gis"], "Surveying & GIS", 12],
      ["Construction Management", ["construction management", "primavera", "ms project", "site execution"], "Construction Project Management", 16],
    ],
    "Electrical & Power": [
      ["Power Systems", ["power systems", "power system", "transmission", "distribution", "substation"], "Power Systems Engineering", 20],
      ["Power Electronics", ["power electronics", "inverter", "converters", "motor drives"], "Power Electronics & Drives", 20],
      ["Electrical Machines", ["electrical machines", "transformers", "motors", "generators"], "Electrical Machines Refresher", 12],
      ["Battery & EV Systems", ["battery management", "bms", "ev charging", "battery"], "Battery & EV Systems", 16],
    ],
    "General / Professional": [
      ["Communication", ["communication", "communication skills", "presentation skills", "verbal"], "Business Communication & Presentation", 12],
      ["Teamwork", ["teamwork", "team player", "collaboration", "interpersonal"], "Teamwork & Interpersonal Skills", 6],
      ["Leadership", ["leadership", "ownership", "mentoring"], "Leadership Development", 8],
      ["Problem Solving & Aptitude", ["analytical", "aptitude", "logical reasoning", "critical thinking"], "Aptitude & Logical Reasoning", 20],
      ["Project Management", ["project management", "pmp", "stakeholder"], "Project Management Basics", 10],
      ["MS Office", ["ms office", "microsoft office", "powerpoint", "ms word"], "MS Office Productivity", 8],
    ],
  },

  /* ---------- 2026–27 Outlook (indicative demand index 0–100; edit as needed) ---------- */
  outlook: [
    ["AI / ML", 95], ["Semiconductor / VLSI", 92], ["Data Science", 90], ["Cloud", 88],
    ["Cybersecurity", 85], ["Robotics & Automation", 80], ["EV & Automotive", 78], ["Core Engineering", 65],
  ],
  outlookNote: "AI, Semiconductor and Cloud show the highest demand. Values are indicative — update them each season.",
};
