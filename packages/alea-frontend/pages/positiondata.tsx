import { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import MainLayout from "../layouts/MainLayout";

const PositionDataSelector: React.FC = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  
  useEffect(() => {
    fetch("/api/get-concept-position")
      .then((res) => res.json())
      .then((data) => setFolders(data.folders || []))
      .catch((err) => console.error("Error fetching folders:", err));
  }, []);

 
  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder);
    setSelectedFile(null);
    setFileContent(null);

    fetch("/api/get-concept-position", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderName: folder }),
    })
      .then((res) => res.json())
      .then((data) => setFiles(data.files || []))
      .catch((err) => console.error("Error fetching files:", err));
  };

  
  const handleFileSelect = async (file: string) => {
    setSelectedFile(file);
    if (!selectedFolder) return;

    try {
      const response = await fetch(
        `/api/get-concept-position?folder=${selectedFolder}&file=${file}`
      );
      const data = await response.json();
      setFileContent(data.content || "Error reading file");
    } catch (err) {
      console.error("Error reading file:", err);
      setFileContent("Error fetching file content");
    }
  };

  
  const handleCopyToClipboard = async () => {
    if (!fileContent) return;

    try {
      await navigator.clipboard.writeText(fileContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); 
    } catch (err) {
      console.error("Error copying text:", err);
      handleCopyFallback();
    }
  };

  
  const handleCopyFallback = () => {
    if (!fileContent) return;

    const textarea = document.createElement("textarea");
    textarea.value = fileContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "100vh",
          backgroundColor: "#f4f6f8",
          padding: 3,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: "600px",
            boxShadow: 3,
            borderRadius: "12px",
            backgroundColor: "white",
          }}
        >
          <CardHeader
            title="Concepts Position Info"
            sx={{
              textAlign: "center",
              backgroundColor: "#1976d2",
              color: "white",
              borderRadius: "12px 12px 0 0",
              padding: 2,
            }}
          />
          <CardContent>
            <Grid container spacing={3}>
              {/* Folder Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Select Device ID
                </Typography>
                <Select
                  fullWidth
                  value={selectedFolder || ""}
                  onChange={(e) => handleFolderSelect(e.target.value)}
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                  }}
                >
                  {folders.map((folder) => (
                    <MenuItem key={folder} value={folder}>
                      {folder}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* File Selection */}
              {selectedFolder && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Select Recording ID
                  </Typography>
                  <Select
                    fullWidth
                    value={selectedFile || ""}
                    onChange={(e) => handleFileSelect(e.target.value)}
                    sx={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                    }}
                  >
                    {files.map((file) => (
                     <MenuItem key={file} value={file}>
                     {file.replace(/\.[^/.]+$/, "")} 
                   </MenuItem>
                   
                    ))}
                  </Select>
                </Grid>
              )}

              {/* Display File Content */}
              {fileContent && (
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ marginBottom: 1 }}
                  >
                    File Content
                  </Typography>
                  <Box
                    sx={{
                      padding: 2,
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                      position: "relative",
                      minHeight: "80px",
                      maxHeight: "300px",
                      overflow: "auto",
                      wordBreak: "break-word",
                    }}
                  >
                    {/* Copy Icon Button with Tooltip */}
                    <Tooltip title={copySuccess ? "Copied!" : "Copy"}>
                      <IconButton
                        onClick={handleCopyToClipboard}
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          color: copySuccess ? "green" : "black",
                          transition: "color 0.3s",
                          "&:hover": {
                            color: "blue",
                          },
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>

                    {/* File Content Display */}
                    <Typography variant="body2">{fileContent}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default PositionDataSelector;
