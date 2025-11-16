import React from 'react';
import { Card, CardContent, CardHeader, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { WordCloud } from '@isoterik/react-word-cloud';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

const WordCloudComponent = ({ data }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
        <Card elevation={3}>
            <CardHeader title="Nuvem de Palavras" avatar={<CloudQueueIcon />} />
            <CardContent>
                <Typography>Não há dados suficientes para gerar a nuvem de palavras.</Typography>
            </CardContent>
        </Card>
    );
  }

  const wordCloudData = data.map(item => ({
    text: item.word,
    value: item.count,
  }));

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
  ];

  return (
    <Card elevation={3}>
      <CardHeader title="Nuvem de Palavras" subheader="Termos mais frequentes nas respostas de texto" avatar={<CloudQueueIcon />} />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <WordCloud
            data={wordCloudData}
            width={500}
            height={400}
            font="Arial"
            fontWeight="bold"
            fontSize={(word) => Math.sqrt(word.value) * 5}
            spiral="archimedean"
            rotate={0}
            padding={2}
            colors={colors}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default WordCloudComponent;
