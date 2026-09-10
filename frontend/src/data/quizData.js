export const QUIZ_SUBJECTS = {
  languages: [
    {
      id: "python",
      name: "Python",
      icon: "code",
      symbol: "data_object",
      tag: "Data Structures & AI",
      isAI: true,
      description: "AI-Powered Assessment. Tests variables, functions, OOP, data structures, outputs, and standard libraries with dynamic NLP evaluation.",
      level: "Intermediate",
      duration: "10 mins",
      totalQuestions: 10,
      xpReward: 120,
      badgeName: "Python Pro",
      badgeIcon: "terminal",
      certTitle: "Python Programming & Core Algorithms",
      questions: [
        {
          id: 1,
          question: "Which of the following is a mutable data type in Python?",
          category: "Data Structures",
          options: ["Integer", "String", "List", "Tuple"],
          correctIndex: 2,
          explanation: "Lists in Python are mutable, meaning their elements can be changed, added, or removed in-place without creating a new object."
        },
        {
          id: 2,
          question: "What will be the output of `[x**2 for x in range(5) if x % 2 != 0]`?",
          category: "List Comprehensions",
          options: ["[0, 4, 16]", "[1, 9]", "[1, 4, 9]", "[0, 1, 9]"],
          correctIndex: 1,
          explanation: "Range 5 produces 0, 1, 2, 3, 4. The odd numbers are 1 and 3. Their squares are 1 and 9: `[1, 9]`."
        },
        {
          id: 3,
          question: "How do you define a generator function in Python?",
          category: "Functions & Iterators",
          options: ["Using the `return` keyword inside a class", "Using the `yield` keyword instead of `return`", "By wrapping a function in `@generator` decorator", "By subclassing `collections.Iterator`"],
          correctIndex: 1,
          explanation: "A generator function uses `yield` to return items one at a time, pausing its state between calls and resuming when next() is invoked."
        },
        {
          id: 4,
          question: "In Python, which built-in function is used to create an iterator over key-value pairs of a dictionary?",
          category: "Standard Library",
          options: ["dict.entries()", "dict.pairs()", "dict.items()", "dict.all()"],
          correctIndex: 2,
          explanation: "`dict.items()` returns a dynamic view object displaying a list of dictionary's (key, value) tuple pairs."
        },
        {
          id: 5,
          question: "What is the time complexity of searching for a key in a Python `dict` on average?",
          category: "Algorithms & Complexity",
          options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
          correctIndex: 2,
          explanation: "Python dictionaries use hash tables, giving average time complexity of O(1) for lookup, insertion, and deletion."
        }
      ]
    },
    {
      id: "cpp",
      name: "C++",
      icon: "terminal",
      symbol: "terminal",
      tag: "Systems & DSA",
      description: "Understand pointers, memory management, templates, and advanced object-oriented programming concepts.",
      level: "Advanced",
      duration: "10 mins",
      totalQuestions: 5,
      xpReward: 120,
      badgeName: "C++ Master",
      badgeIcon: "memory",
      certTitle: "Modern C++ & Low-Level Memory Management",
      questions: [
        {
          id: 1,
          question: "Which smart pointer in C++11 represents exclusive ownership of a dynamically allocated resource?",
          category: "Memory Management",
          options: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::auto_ptr"],
          correctIndex: 1,
          explanation: "`std::unique_ptr` owns and manages another object through a pointer and disposes of that object when the `unique_ptr` goes out of scope."
        },
        {
          id: 2,
          question: "What happens when a base class destructor is NOT declared virtual in C++?",
          category: "Object-Oriented Programming",
          options: ["Compilation error", "Undefined behavior when deleting a derived object via base pointer", "Memory is automatically freed by RAII", "Virtual method table is disabled"],
          correctIndex: 1,
          explanation: "Deleting an instance of a derived class through a pointer to a base class without a virtual destructor results in undefined behavior and memory leaks."
        },
        {
          id: 3,
          question: "What is the purpose of the `std::move` utility in C++?",
          category: "Move Semantics",
          options: ["Copies memory directly with memcpy", "Converts an lvalue into an rvalue reference to enable move semantics", "Allocates heap memory for rvalues", "Synchronizes threads across CPU cores"],
          correctIndex: 1,
          explanation: "`std::move` performs an unconditional cast to an rvalue reference, indicating that an object can be 'moved from'."
        },
        {
          id: 4,
          question: "Which data structure guarantees O(1) amortized insertion at the back in standard C++?",
          category: "STL Containers",
          options: ["std::vector", "std::list", "std::set", "std::map"],
          correctIndex: 0,
          explanation: "`std::vector::push_back` runs in O(1) amortized time, reallocating memory exponentially when capacity is exhausted."
        },
        {
          id: 5,
          question: "What is RAII (Resource Acquisition Is Initialization) in C++?",
          category: "Idioms & Best Practices",
          options: ["Initializing variables to null at startup", "Binding the lifecycle of resources to object lifetime via constructor and destructor", "Running garbage collector on idle threads", "Automatic zeroing of heap memory"],
          correctIndex: 1,
          explanation: "RAII guarantees that resources are properly released when their holding object goes out of scope."
        }
      ]
    },
    {
      id: "javascript",
      name: "JavaScript",
      icon: "javascript",
      symbol: "javascript",
      tag: "Web & Fullstack",
      description: "Evaluate your knowledge of asynchronous JS, event loop, closures, prototypes, and ES6+ modern features.",
      level: "Intermediate",
      duration: "10 mins",
      totalQuestions: 5,
      xpReward: 90,
      badgeName: "JS Architect",
      badgeIcon: "code",
      certTitle: "Modern JavaScript & Async Architecture",
      questions: [
        {
          id: 1,
          question: "What is the result of `typeof null` in JavaScript?",
          category: "Core Language",
          options: ["'null'", "'undefined'", "'object'", "'boolean'"],
          correctIndex: 2,
          explanation: "In JavaScript, `typeof null === 'object'` is a legacy quirk from the initial JS implementation where type tags were used."
        },
        {
          id: 2,
          question: "Which of the following is executed in the Microtask Queue in the JavaScript Event Loop?",
          category: "Event Loop & Async",
          options: ["setTimeout callback", "setInterval callback", "Promise.then() callback", "DOM Click Event"],
          correctIndex: 2,
          explanation: "`Promise.then()`, `queueMicrotask()`, and `MutationObserver` callbacks run in the microtask queue, which drains before macrotasks (like `setTimeout`)."
        },
        {
          id: 3,
          question: "What is a JavaScript closure?",
          category: "Scopes & Closures",
          options: ["A function that closes the browser window", "A combination of a function bundled together with references to its surrounding lexical environment", "A private method inside an ES6 class", "An immediately invoked function expression without return"],
          correctIndex: 1,
          explanation: "A closure gives you access to an outer function's scope from an inner function, preserved even after the outer function finishes executing."
        },
        {
          id: 4,
          question: "How do arrow functions behave with respect to the `this` keyword?",
          category: "ES6 Features",
          options: ["They bind `this` to the global object", "They dynamically bind `this` at call time", "They retain the `this` value of the enclosing lexical context", "They have their own isolated `this` context"],
          correctIndex: 2,
          explanation: "Arrow functions do not have their own `this` binding; they capture the `this` value of the enclosing execution context."
        },
        {
          id: 5,
          question: "Which Array method returns a new array with all elements that pass a test implemented by the provided function?",
          category: "Functional Programming",
          options: ["map()", "filter()", "reduce()", "forEach()"],
          correctIndex: 1,
          explanation: "`Array.prototype.filter()` creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test."
        }
      ]
    },
    {
      id: "java",
      name: "Java",
      icon: "coffee",
      symbol: "coffee",
      tag: "Enterprise & OOP",
      description: "Learn core Java principles, JVM architecture, concurrency, collections, and enterprise patterns.",
      level: "Intermediate",
      duration: "10 mins",
      totalQuestions: 5,
      xpReward: 100,
      badgeName: "Java Artisan",
      badgeIcon: "verified",
      certTitle: "Enterprise Java & JVM Fundamentals",
      questions: [
        {
          id: 1,
          question: "Which Java collection class is thread-safe without explicit synchronization?",
          category: "Concurrency & Collections",
          options: ["ArrayList", "ConcurrentHashMap", "HashMap", "TreeSet"],
          correctIndex: 1,
          explanation: "`ConcurrentHashMap` provides fine-grained lock striping and thread-safe operations without locking the entire map."
        },
        {
          id: 2,
          question: "What is the key difference between an interface and an abstract class in Java 8+?",
          category: "OOP Design",
          options: ["Interfaces cannot have method implementations", "A class can implement multiple interfaces, but extend only one class", "Abstract classes cannot have state or fields", "Interfaces are faster in bytecode execution"],
          correctIndex: 1,
          explanation: "Java supports multiple interface inheritance, whereas single inheritance applies to abstract and concrete classes."
        },
        {
          id: 3,
          question: "What does the `transient` keyword signify when applied to a class field in Java?",
          category: "Serialization",
          options: ["The field is immutable", "The field should not be serialized when the object is converted to a byte stream", "The field is shared among all threads", "The field is allocated on the stack instead of heap"],
          correctIndex: 1,
          explanation: "`transient` indicates that a field should not be included in standard Java object serialization."
        },
        {
          id: 4,
          question: "Where are objects allocated in the Java Virtual Machine (JVM)?",
          category: "JVM Memory Model",
          options: ["Method Area", "Stack Memory", "Heap Memory", "Native Memory Registers"],
          correctIndex: 2,
          explanation: "All class instances and arrays in Java are dynamically allocated in the Heap memory managed by the Garbage Collector."
        },
        {
          id: 5,
          question: "What is the purpose of `Optional<T>` introduced in Java 8?",
          category: "Modern Java",
          options: ["To speed up stream processing", "To provide a type-level solution for representing optional values instead of returning `null`", "To create optional function parameters", "To disable checked exceptions"],
          correctIndex: 1,
          explanation: "`Optional<T>` is a container object used to avoid `NullPointerException` and represent the presence or absence of a value cleanly."
        }
      ]
    },
    {
      id: "rust",
      name: "Rust",
      icon: "developer_mode",
      symbol: "developer_mode",
      tag: "Memory Safety & Concurrency",
      description: "Test your mastery over ownership, borrowing, lifetimes, pattern matching, and fear-free concurrency.",
      level: "Advanced",
      duration: "10 mins",
      totalQuestions: 5,
      xpReward: 130,
      badgeName: "Rust Ace",
      badgeIcon: "bolt",
      certTitle: "Rust Systems & Memory Safety Specialist",
      questions: [
        {
          id: 1,
          question: "What are the rules of references in Rust?",
          category: "Borrow Checker",
          options: ["You can have multiple mutable references at once", "You can have either one mutable reference or any number of immutable references, and references must always be valid", "References are freed by a garbage collector cycle", "Pointers must be wrapped in `unsafe` blocks"],
          correctIndex: 1,
          explanation: "Rust's borrow checker enforces: at any given time, you can have either one mutable reference or any number of immutable references, and references must always be valid."
        },
        {
          id: 2,
          question: "Which smart pointer enables shared ownership on a single thread in Rust?",
          category: "Smart Pointers",
          options: ["Box<T>", "Rc<T>", "Arc<T>", "RefCell<T>"],
          correctIndex: 1,
          explanation: "`Rc<T>` is a reference-counting pointer for single-threaded scenarios. For multi-threaded shared ownership, `Arc<T>` is used."
        },
        {
          id: 3,
          question: "What happens when a variable goes out of scope in Rust?",
          category: "Ownership",
          options: ["The compiler pauses thread execution", "Rust automatically calls the `drop` function and frees heap memory", "The memory remains until GC sweeps", "A reference error is thrown"],
          correctIndex: 1,
          explanation: "Rust uses RAII and ownership rules: when a value owner goes out of scope, its `Drop` implementation is invoked automatically to reclaim memory."
        },
        {
          id: 4,
          question: "How does Rust handle recoverable errors idiomaticallly?",
          category: "Error Handling",
          options: ["Using try/catch exceptions", "Using the `Result<T, E>` enum with the `?` operator", "Using global error codes", "Using NULL pointer checks"],
          correctIndex: 1,
          explanation: "Rust avoids exceptions, using `Result<T, E>` and `Option<T>` enums with pattern matching and the `?` operator."
        },
        {
          id: 5,
          question: "What trait must a type implement to be safely transferred across thread boundaries?",
          category: "Concurrency",
          options: ["Copy", "Send", "Sync", "Clone"],
          correctIndex: 1,
          explanation: "The `Send` marker trait indicates that ownership of the type can be transferred across threads safely."
        }
      ]
    }
  ],
  topics: [
    {
      id: "web-dev",
      name: "Web Development",
      icon: "language",
      symbol: "language",
      tag: "HTML, CSS, JS & React",
      isAI: true,
      description: "AI-Powered Assessment. Frontend architecture, responsive design, React components, state, HTTP protocols, and Web APIs.",
      level: "Beginner to Pro",
      duration: "10 mins",
      totalQuestions: 10,
      xpReward: 120,
      badgeName: "Web Wizard",
      badgeIcon: "language",
      certTitle: "Fullstack Web Engineering & Responsive UI",
      questions: [
        {
          id: 1,
          question: "What is the purpose of Semantic HTML elements like `<header>`, `<main>`, and `<article>`?",
          category: "HTML5 & Accessibility",
          options: ["They provide custom CSS styling by default", "They give meaningful structure to web documents for browsers, search engines, and screen readers", "They isolate JavaScript execution context", "They prevent page reloading"],
          correctIndex: 1,
          explanation: "Semantic tags describe their meaning to both the browser and developer, improving accessibility and SEO."
        },
        {
          id: 2,
          question: "In CSS Flexbox, which property aligns flex items along the cross axis?",
          category: "CSS Layout",
          options: ["justify-content", "align-items", "flex-direction", "align-self"],
          correctIndex: 1,
          explanation: "`align-items` aligns flex items along the cross axis, while `justify-content` aligns along the main axis."
        },
        {
          id: 3,
          question: "What hook in React is used to perform side effects like data fetching or DOM subscriptions?",
          category: "React Hooks",
          options: ["useState", "useMemo", "useEffect", "useCallback"],
          correctIndex: 2,
          explanation: "`useEffect` tells React that your component needs to do something after rendering, such as fetching data or setting up event listeners."
        },
        {
          id: 4,
          question: "What is CORS in web browsers?",
          category: "Web Security",
          options: ["Cascading Override Rule Set", "Cross-Origin Resource Sharing security mechanism", "Cryptographic Object Routing System", "Cookie Optimization & Redirection Standard"],
          correctIndex: 1,
          explanation: "CORS is an HTTP-header based security mechanism that allows a server to indicate any origins other than its own from which a browser should permit loading resources."
        },
        {
          id: 5,
          question: "Which HTTP status code represents 'Unauthorized' access?",
          category: "HTTP Protocols",
          options: ["200", "401", "403", "404"],
          correctIndex: 1,
          explanation: "401 Unauthorized indicates that the client request has not been completed because it lacks valid authentication credentials."
        }
      ]
    },
    {
      id: "app-dev",
      name: "App Development",
      icon: "smartphone",
      symbol: "smartphone",
      tag: "Android, iOS & React Native",
      isAI: true,
      description: "AI-Powered Assessment. Mobile architecture, Android activity lifecycle, intents, UI state, memory management, and cross-platform native patterns.",
      level: "Intermediate",
      duration: "10 mins",
      totalQuestions: 10,
      xpReward: 120,
      badgeName: "Mobile Architect",
      badgeIcon: "smartphone",
      certTitle: "Mobile Application Engineering & Android Architecture",
      questions: [
        {
          id: 1,
          question: "Which Android lifecycle method is called first when an activity is launched?",
          category: "Activity Lifecycle",
          options: ["onStart()", "onCreate()", "onResume()", "onRestart()"],
          correctIndex: 1,
          explanation: "`onCreate()` is called when the activity is first created, initializing vital components and view bindings."
        },
        {
          id: 2,
          question: "In Android, which component is used to perform background tasks without user interface?",
          category: "Android Architecture",
          options: ["Activity", "Service", "BroadcastReceiver", "ContentProvider"],
          correctIndex: 1,
          explanation: "A `Service` is an application component that can perform long-running operations in the background."
        },
        {
          id: 3,
          question: "What is an Explicit Intent in Android?",
          category: "Intents & IPC",
          options: ["An intent specifying the exact target component class name", "An intent requesting any app capable of handling an action", "An intent for web browsing only", "A system broadcast for low battery"],
          correctIndex: 0,
          explanation: "An explicit intent specifies the target component directly by its fully-qualified class name."
        },
        {
          id: 4,
          question: "What is the primary purpose of Jetpack Compose / Flutter / React Native?",
          category: "Declarative UI",
          options: ["Writing database queries in SQL", "Building modern declarative reactive user interfaces across platforms", "Compiling Linux kernels", "Encrypting passwords on device"],
          correctIndex: 1,
          explanation: "Declarative UI frameworks let developers describe the UI state reactively rather than mutating views imperatively."
        },
        {
          id: 5,
          question: "Which lifecycle state indicates that an activity is no longer visible to the user?",
          category: "Activity Lifecycle",
          options: ["Paused state", "Stopped state", "Destroyed state", "Running state"],
          correctIndex: 1,
          explanation: "When an activity is completely obscured and no longer visible on screen, it enters the `Stopped` state (`onStop()`)."
        }
      ]
    },
    {
      id: "data-science",
      name: "Data Science",
      icon: "bar_chart",
      symbol: "bar_chart",
      tag: "Pandas, NumPy & Stats",
      description: "Python for data analysis, Pandas DataFrame wrangling, exploratory data analysis, and statistical testing.",
      level: "Intermediate",
      duration: "10 mins",
      totalQuestions: 5,
      xpReward: 110,
      badgeName: "Data Prodigy",
      badgeIcon: "bar_chart",
      certTitle: "Applied Data Science & Statistical Analysis",
      questions: [
        {
          id: 1,
          question: "Which Pandas function is used to calculate summary statistics for all numeric columns?",
          category: "Data Wrangling",
          options: ["df.summary()", "df.describe()", "df.info()", "df.stats()"],
          correctIndex: 1,
          explanation: "`df.describe()` generates descriptive statistics that summarize the central tendency, dispersion, and shape of a dataset's distribution."
        },
        {
          id: 2,
          question: "What is the primary advantage of NumPy arrays over standard Python lists?",
          category: "NumPy Vectorization",
          options: ["NumPy arrays can contain any heterogeneous data types", "Contiguous memory layout and vectorized C-level execution for fast computations", "NumPy arrays automatically run on GPUs", "NumPy arrays have unlimited memory"],
          correctIndex: 1,
          explanation: "NumPy arrays store elements in contiguous memory blocks and utilize SIMD CPU instructions for fast vectorized operations."
        },
        {
          id: 3,
          question: "In statistics, what does a p-value less than 0.05 typically indicate in hypothesis testing?",
          category: "Statistical Inference",
          options: ["The null hypothesis is definitely true", "Statistically significant evidence to reject the null hypothesis", "There is a 95% error rate in data collection", "The dataset needs more samples"],
          correctIndex: 1,
          explanation: "A p-value < 0.05 indicates strong evidence against the null hypothesis, so you reject the null hypothesis in favor of the alternative."
        },
        {
          id: 4,
          question: "Which method in Pandas is used to group data based on one or more keys for split-apply-combine analysis?",
          category: "Aggregation",
          options: ["df.cluster()", "df.groupby()", "df.pivot_table()", "df.split()"],
          correctIndex: 1,
          explanation: "`df.groupby()` splits data into groups based on some criteria, applies a function to each group, and combines the results."
        },
        {
          id: 5,
          question: "What is One-Hot Encoding used for in data preprocessing?",
          category: "Feature Engineering",
          options: ["Normalizing continuous numbers between 0 and 1", "Converting categorical variables into binary dummy vectors", "Compressing images for neural networks", "Handling missing values with mean imputation"],
          correctIndex: 1,
          explanation: "One-Hot Encoding transforms categorical values into binary columns, making them digestible by machine learning models without imposing ordinal bias."
        }
      ]
    },
    {
      id: "machine-learning",
      name: "Machine Learning",
      icon: "smart_toy",
      symbol: "smart_toy",
      tag: "Supervised & Deep Learning",
      description: "Regression, classification, loss functions, gradient descent, neural networks, and model evaluation metrics.",
      level: "Intermediate to Advanced",
      duration: "10 mins",
      totalQuestions: 5,
      xpReward: 125,
      badgeName: "AI Specialist",
      badgeIcon: "psychology",
      certTitle: "Machine Learning & Neural Architecture",
      questions: [
        {
          id: 1,
          question: "What is overfitting in machine learning models?",
          category: "Model Evaluation",
          options: ["The model performs poorly on training data and test data", "The model learns training noise and performs well on training data but fails to generalize to unseen data", "The model training time is too long", "The model parameters are all zero"],
          correctIndex: 1,
          explanation: "Overfitting happens when a model memorizes training noise instead of the underlying pattern, leading to high training accuracy but poor generalization."
        },
        {
          id: 2,
          question: "Which evaluation metric is best suited for highly imbalanced classification datasets (e.g. fraud detection)?",
          category: "Metrics",
          options: ["Accuracy", "Precision-Recall AUC / F1-Score", "Mean Squared Error", "R-squared"],
          correctIndex: 1,
          explanation: "When positive class is rare (e.g., 99% negative), Accuracy is misleading. Precision, Recall, and F1-Score / PR-AUC focus on the positive minority class."
        },
        {
          id: 3,
          question: "What is the role of an activation function like ReLU in deep neural networks?",
          category: "Deep Learning",
          options: ["To prevent overfitting by randomly dropping weights", "To introduce non-linearity, allowing the network to learn complex non-linear patterns", "To speed up disk caching", "To normalize inputs to standard normal distribution"],
          correctIndex: 1,
          explanation: "Without non-linear activation functions like ReLU, a deep neural network would collapse into a single linear transformation regardless of depth."
        },
        {
          id: 4,
          question: "What does L2 Regularization (Ridge) add to the loss function?",
          category: "Regularization",
          options: ["Sum of absolute values of weights", "Sum of squared magnitude of weights", "Maximum weight threshold", "Number of non-zero parameters"],
          correctIndex: 1,
          explanation: "L2 regularization adds a penalty equal to the square of the magnitude of coefficients, penalizing overly large weights."
        },
        {
          id: 5,
          question: "Which algorithm finds optimal model parameters by iteratively moving in the direction of steepest descent of the loss function?",
          category: "Optimization",
          options: ["Gradient Descent", "Random Forest", "K-Means", "DBSCAN"],
          correctIndex: 0,
          explanation: "Gradient Descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function."
        }
      ]
    },
    {
      id: "cloud-computing",
      name: "Cloud Computing",
      icon: "cloud",
      symbol: "cloud",
      tag: "AWS, Docker & Microservices",
      description: "Cloud architecture, containerization, serverless functions, CI/CD pipelines, and scalability patterns.",
      level: "Intermediate",
      duration: "10 mins",
      totalQuestions: 5,
      xpReward: 110,
      badgeName: "Cloud Pioneer",
      badgeIcon: "cloud",
      certTitle: "Cloud Architecture & Scalable Infrastructure",
      questions: [
        {
          id: 1,
          question: "What is the key difference between IaaS and PaaS in cloud computing?",
          category: "Cloud Models",
          options: ["IaaS gives full control over OS and virtual machines; PaaS abstracts the OS/runtime allowing developers to focus purely on application code", "PaaS is always cheaper than IaaS", "IaaS is only used for databases", "PaaS requires manual hardware installation"],
          correctIndex: 0,
          explanation: "IaaS (Infrastructure as a Service) provides virtualized computing infrastructure, while PaaS (Platform as a Service) manages runtime, OS, and middleware."
        },
        {
          id: 2,
          question: "What is Docker containerization primarily designed to solve?",
          category: "Containers & DevOps",
          options: ["Replacing all programming languages", "Eliminating the 'works on my machine' problem by bundling application and dependencies in a portable lightweight image", "Encrypting database hard drives", "Running serverless functions without networking"],
          correctIndex: 1,
          explanation: "Docker packages an application and its dependencies into isolated containers that run consistently across any environment."
        },
        {
          id: 3,
          question: "What is Serverless computing (e.g. AWS Lambda / Cloud Functions)?",
          category: "Serverless Architecture",
          options: ["Computing without any computers or servers", "An execution model where the cloud provider dynamically manages server allocation and charges only for active compute execution time", "Local offline hosting on user devices", "Running applications strictly on physical bare-metal hardware"],
          correctIndex: 1,
          explanation: "In serverless computing, developers write functions without provisioning servers, and billing is based on milliseconds of compute time used."
        },
        {
          id: 4,
          question: "What is the main benefit of Auto-Scaling Groups in cloud platforms?",
          category: "Reliability & Scalability",
          options: ["Automatically resizing UI buttons for mobile screens", "Dynamically increasing or decreasing compute instances based on live incoming traffic and demand", "Automatically restarting failed database nodes only at midnight", "Formatting source code in production"],
          correctIndex: 1,
          explanation: "Auto-scaling automatically adjusts capacity to maintain steady, predictable performance at the lowest possible cost."
        },
        {
          id: 5,
          question: "In cloud storage, what is Object Storage (e.g., AWS S3, Google Cloud Storage) optimized for?",
          category: "Cloud Storage",
          options: ["Running OS boot partitions", "Storing and retrieving arbitrary amounts of unstructured data with high durability via REST APIs", "In-memory caching with sub-millisecond RAM latency", "Relational SQL joins"],
          correctIndex: 1,
          explanation: "Object storage is highly scalable and durable, designed for static media, backups, data lakes, and document storage accessed via HTTP/REST."
        }
      ]
    }
  ],
  company: [
    {
      id: "google-sde",
      name: "Google Coding & System Diagnostic",
      icon: "code",
      symbol: "terminal",
      company: "Google",
      tag: "SDE & Algorithmic Problem Solving",
      isAI: true,
      description: "Advanced DP, Graph Theory, Topological Sort, Red-Black Trees & Scalable Distributed Caching.",
      level: "Hard • L3/L4 SDE",
      duration: "30 Mins",
      totalQuestions: 15,
      xpReward: 250,
      badgeName: "Google SDE Ready",
      badgeIcon: "terminal",
      certTitle: "Google SDE & Algorithmic Problem Solving Assessment",
      passRate: "92%",
      candidatesCount: "18k",
      rating: "4.9",
      questions: [
        {
          id: 1,
          question: "In topological sorting of a Directed Acyclic Graph (DAG), what does Kahn's algorithm use to keep track of vertices ready for processing?",
          category: "Graph Algorithms",
          options: ["In-degrees of vertices using a Queue", "Out-degrees of vertices using a Stack", "Disjoint Set Union (DSU) ranks", "Floyd-Warshall distance matrix"],
          correctIndex: 0,
          explanation: "Kahn's algorithm computes in-degrees of all vertices and pushes vertices with in-degree 0 into a queue."
        },
        {
          id: 2,
          question: "What is the worst-case space complexity of a Trie storing N strings of average length L?",
          category: "Advanced Data Structures",
          options: ["O(N * L * Σ) where Σ is alphabet size", "O(N + L)", "O(N log L)", "O(1)"],
          correctIndex: 0,
          explanation: "In the worst case where no strings share prefixes, Trie space complexity is O(N * L * Σ)."
        },
        {
          id: 3,
          question: "How does Consistent Hashing minimize key remapping when nodes are added or removed in distributed caches?",
          category: "System Design",
          options: ["By mapping both servers and keys to a continuous hash ring", "By using round-robin DNS routing", "By storing a centralized master table on every node", "By encrypting cache keys with SHA-256"],
          correctIndex: 0,
          explanation: "Consistent hashing maps nodes and keys to a ring structure so adding/removing a node only remaps K/N keys on average."
        }
      ]
    },
    {
      id: "amazon-sde",
      name: "Leadership Principles & System Architecture",
      icon: "cloud",
      symbol: "cloud",
      company: "Amazon",
      tag: "Customer Obsession & Distributed Systems",
      isAI: true,
      description: "Customer Obsession scenarios, OOP Principles, AWS Baseline & Distributed Cache strategies.",
      level: "Intermediate • SDE I",
      duration: "25 Mins",
      totalQuestions: 20,
      xpReward: 200,
      badgeName: "Amazon SDE Ready",
      badgeIcon: "cloud",
      certTitle: "Amazon Leadership & Cloud Architecture Assessment",
      passRate: "87%",
      candidatesCount: "24k",
      rating: "4.8",
      questions: [
        {
          id: 1,
          question: "According to Amazon's 'Customer Obsession' Leadership Principle, what should drive engineering decisions?",
          category: "Leadership Principles",
          options: ["Working backwards from customer needs and building trust", "Adopting trendy technologies regardless of user impact", "Minimizing hardware cost above user experience", "Prioritizing speed over software reliability"],
          correctIndex: 0,
          explanation: "Leaders start with the customer and work backwards, working vigorously to earn and keep customer trust."
        },
        {
          id: 2,
          question: "In AWS DynamoDB, how do Global Secondary Indexes (GSIs) differ from Local Secondary Indexes (LSIs)?",
          category: "Cloud Database Architecture",
          options: ["GSIs can have a partition key and sort key different from the base table", "LSIs can be created at any time after table creation", "GSIs share the throughput of the base table", "LSIs support cross-region replication automatically"],
          correctIndex: 0,
          explanation: "GSIs can be created at any time with a partition key and sort key different from the base table's primary key."
        }
      ]
    },
    {
      id: "nvidia-ai",
      name: "CUDA, Parallel Computing & C++ Hardware",
      icon: "memory",
      symbol: "memory",
      company: "NVIDIA",
      tag: "GPU Kernels & SIMD Primitives",
      isAI: true,
      description: "GPU Thread hierarchies, memory coalescence, pointer arithmetic, shared memory & SIMD primitives.",
      level: "Hard • AI Kernel Engineer",
      duration: "30 Mins",
      totalQuestions: 15,
      xpReward: 250,
      badgeName: "NVIDIA CUDA Specialist",
      badgeIcon: "bolt",
      certTitle: "NVIDIA CUDA & Parallel Computing Kernel Specialist",
      passRate: "79%",
      candidatesCount: "9.2k",
      rating: "4.95",
      questions: [
        {
          id: 1,
          question: "In NVIDIA CUDA programming, what is a 'warp'?",
          category: "GPU Architecture",
          options: ["A group of 32 threads executed concurrently by an SM in SIMT fashion", "A memory buffer in global VRAM", "A host CPU thread managing PCI Express transfers", "An asynchronous stream handle"],
          correctIndex: 0,
          explanation: "A warp is a set of 32 threads within a thread block that execute the same instruction simultaneously in SIMT mode."
        }
      ]
    },
    {
      id: "tcs-nqt",
      name: "TCS NQT Foundation & Advanced Cognitive",
      icon: "apartment",
      symbol: "domain",
      company: "TCS",
      tag: "Numerical, Reasoning & Pseudocode",
      isAI: false,
      description: "Numerical ability, abstract reasoning, C/Java pseudocode tracing, data interpretations & logic.",
      level: "Placement Ready • Ninja/Digital",
      duration: "40 Mins",
      totalQuestions: 30,
      xpReward: 180,
      badgeName: "TCS NQT Certified",
      badgeIcon: "workspace_premium",
      certTitle: "TCS National Qualifier Test (NQT) Technical Certification",
      passRate: "81%",
      candidatesCount: "48k",
      rating: "4.7",
      questions: [
        {
          id: 1,
          question: "What is the output of pseudocode: `int x = 5, y = 10; x = x ^ y; y = x ^ y; x = x ^ y;`?",
          category: "Pseudocode Tracing",
          options: ["x = 10, y = 5", "x = 5, y = 10", "x = 15, y = 15", "x = 0, y = 0"],
          correctIndex: 0,
          explanation: "Bitwise XOR swap swaps the values of x and y without using a temporary variable, yielding x = 10 and y = 5."
        }
      ]
    },
    {
      id: "capgemini-tech",
      name: "Capgemini Tech Challenge & Pseudo-Code Round",
      icon: "terminal",
      symbol: "sports_esports",
      company: "Capgemini",
      tag: "Logic Puzzles & Recursion Stacks",
      isAI: false,
      description: "Game-based logic puzzles, recursion stacks, bitwise operations, data interpretation & verbal ability.",
      level: "Placement Ready • Analyst Campus",
      duration: "35 Mins",
      totalQuestions: 25,
      xpReward: 180,
      badgeName: "Capgemini Tech Champ",
      badgeIcon: "workspace_premium",
      certTitle: "Capgemini Analyst Campus Technical Certification",
      passRate: "89%",
      candidatesCount: "31k",
      rating: "4.6",
      questions: [
        {
          id: 1,
          question: "What is the maximum depth of recursion stack for `func(n) = func(n-1) + func(n-2)` with `func(1)=1, func(0)=0`?",
          category: "Recursion & Memory",
          options: ["O(n)", "O(2^n)", "O(log n)", "O(1)"],
          correctIndex: 0,
          explanation: "The call stack grows linearly to depth n along the deepest left recursive branch `func(n-1)`."
        }
      ]
    }
  ]
};

export function getQuizForSkill(skillName) {
  if (!skillName) return QUIZ_SUBJECTS.languages[0];
  const s = String(skillName).toLowerCase().trim();

  // Python
  if (s.includes('python') || s === 'py') {
    return QUIZ_SUBJECTS.languages.find(l => l.id === 'python') || QUIZ_SUBJECTS.languages[0];
  }
  // Web Dev / HTML / CSS / Next / Node / React / JS
  if (s.includes('web') || s.includes('html') || s.includes('css') || s.includes('next') || s.includes('node')) {
    return QUIZ_SUBJECTS.topics.find(t => t.id === 'web-dev') || QUIZ_SUBJECTS.topics[0];
  }
  // App Dev / Kotlin / Flutter / Android / iOS
  if (s.includes('app') || s.includes('android') || s.includes('flutter') || s.includes('kotlin') || s.includes('mobile')) {
    return QUIZ_SUBJECTS.topics.find(t => t.id === 'app-dev') || QUIZ_SUBJECTS.topics[0];
  }
  // JavaScript
  if (s.includes('javascript') || s === 'js') {
    return QUIZ_SUBJECTS.languages.find(l => l.id === 'javascript') || QUIZ_SUBJECTS.languages[0];
  }
  // C++ / C
  if (s.includes('c++') || s === 'cpp' || s === 'c') {
    return QUIZ_SUBJECTS.languages.find(l => l.id === 'cpp') || QUIZ_SUBJECTS.languages[0];
  }
  // Rust
  if (s.includes('rust')) {
    return QUIZ_SUBJECTS.languages.find(l => l.id === 'rust') || QUIZ_SUBJECTS.languages[0];
  }
  // Java
  if (s.includes('java') && !s.includes('script')) {
    return QUIZ_SUBJECTS.languages.find(l => l.id === 'java') || QUIZ_SUBJECTS.languages[0];
  }
  // SQL / Data Science
  if (s.includes('sql') || s.includes('data')) {
    return QUIZ_SUBJECTS.topics.find(t => t.id === 'data-science') || QUIZ_SUBJECTS.topics[0];
  }

  // Fallback: match by name or tag
  const all = [...QUIZ_SUBJECTS.languages, ...QUIZ_SUBJECTS.topics];
  return all.find(item => item.name.toLowerCase().includes(s) || item.tag.toLowerCase().includes(s)) || QUIZ_SUBJECTS.languages[0];
}

