import React, { useState } from "react";
import { Error as ErrorIcon } from "@mui/icons-material";
import { Container, Stack, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const NotFound = () => {
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslationClick = () => {
    setShowTranslation(true);
  };

  return (
    <Container maxWidth="lg" sx={{ height: "100vh" }}>
      <Stack
        alignItems="center"
        spacing={{ xs: 2, md: 4 }}
        justifyContent="center"
        height="100%"
      >
        <ErrorIcon sx={{ fontSize: { xs: "5rem", md: "10rem" } }} />
        <Typography variant="h1" sx={{ fontSize: { xs: "3rem", md: "6rem" } }}>
          404
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "1rem", sm: "1.5rem", md: "3rem" },
            wordBreak: "keep-all",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {showTranslation ? "Not Found" : "pneumonoultramicroscopicsilicovolcanoconiosis"}
        </Typography>
        <Typography
          variant="body1"
          onClick={handleTranslationClick}
          sx={{ 
            cursor: "pointer", 
            textDecoration: "underline", 
            color: "primary.main",
            '&:hover': {
              color: 'primary.dark'
            }
          }}
        >
          See Translation
        </Typography>
        <Link
          component={RouterLink}
          to="/"
          variant="body1"
          sx={{ 
            textDecoration: "underline", 
            color: "secondary.main",
            '&:hover': {
              color: 'secondary.dark'
            }
          }}
        >
          Go back to home
        </Link>
      </Stack>
    </Container>
  );
};

export default NotFound;
