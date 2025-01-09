# 3. Frontend Guidelines

This document contains a list of suggestion/best practices while writing frontend code in this repo

## 3.1. CSS

### 3.1.1. Prefer MUI numbers over 'rem' and 'px'

```diff
- <Box sx={{ px: "4px" }}></Box>
+ <Box sx={{ px: 0.5 }}></Box>
```

## 3.2. State management

### 3.2.1. Avoid creating state variables when data can be derived

This leads to unncessary memory use but this is not the main reason. We should avoid creating multiple sources of the same data.
This helps avoid incosistent states. For example, in the following code consider the case when the logic becomes complicated
due to multiple updates of the `files` variable (add, delete, update etc). Using `const numFiles = files.length;` ensures that
the variables `files` and `numFiles` are never out of sync.

```diff
- const [files, setFiles]= useState<string>([]);
- const [numFiles, setNumFiles] = useState(0);

- useEffect(()=> {
-   ...
-  setFiles(files);
-  setNumFiles(files.length);
- }, []);

+ const [files, setFiles]= useState<string>([]);
+ const numFiles = files.length;
+ useEffect(()=> {
+   ...
+   setFiles(files);
+ }, []);

```

## 3.3 Avoid creating large files, splits them into multiple components
