const calculateNPS = (ratings) => {
  if (!ratings || ratings.length === 0) {
    return 0;
  }

  const totalResponses = ratings.length;
  let promoters = 0;
  let detractors = 0;

  ratings.forEach((rating) => {
    if (rating >= 9) {
      promoters++;
    } else if (rating <= 6) {
      detractors++;
    }
  });

  const nps = ((promoters - detractors) / totalResponses) * 100;
  return parseFloat(nps.toFixed(2));
};

module.exports = { calculateNPS };
