import React from 'react';
import { Card, CardContent, CardHeader, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import WordCloud from 'react-wordcloud';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

const WordCloudComponent = ({ data }) => {
  const theme = useTheme();

  const validData = data.filter(item => typeof item.count === 'number' && item.count > 0);

  if (!validData || validData.length === 0) {
    return (
        <Card elevation={3}>
            <CardHeader title="Nuvem de Palavras" avatar={<CloudQueueIcon />} />
            <CardContent>
                <Typography>Não há dados suficientes para gerar a nuvem de palavras.</Typography>
            </CardContent>
        </Card>
    );
  }

  const wordCloudData = validData.map(item => ({
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

  const options = {
    colors,
    fontFamily: 'Arial',
    fontWeights: 'bold',
    padding: 2,
    rotations: 1,
    rotationAngles: [0, 0],
    scale: 'sqrt',
    spiral: 'rectangular',
    deterministic: true,
  };

  return (
    <Card elevation={3}>
      <CardHeader title="Nuvem de Palavras" subheader="Termos mais frequentes nas respostas de texto" avatar={<CloudQueueIcon />} />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <WordCloud
            words={wordCloudData}
            options={options}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default WordCloudComponent;
