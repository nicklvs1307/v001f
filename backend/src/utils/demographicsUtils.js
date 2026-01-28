const { now } = require("./dateUtils");

/**
 * Calculates the age distribution from a list of clients with birth dates.
 * @param {Array<object>} clients - An array of client objects, each with a 'birthDate' property.
 * @returns {object} An object with age groups as keys and their counts as values.
 */
function calculateAgeDistribution(clients) {
  const ageGroups = {
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45-54": 0,
    "55+": 0,
    "N/A": 0,
  };
  const clientsWithBirthDate = clients.filter((c) => c.birthDate);
  const currentYear = now().getFullYear();

  clientsWithBirthDate.forEach((client) => {
    const age = currentYear - new Date(client.birthDate).getFullYear();
    if (age >= 18 && age <= 24) ageGroups["18-24"]++;
    else if (age >= 25 && age <= 34) ageGroups["25-34"]++;
    else if (age >= 35 && age <= 44) ageGroups["35-44"]++;
    else if (age >= 45 && age <= 54) ageGroups["45-54"]++;
    else if (age >= 55) ageGroups["55+"]++;
    else ageGroups["N/A"]++;
  });

  // Add count for clients without birthDate
  ageGroups["N/A"] += clients.length - clientsWithBirthDate.length;

  return ageGroups;
}

/**
 * Calculates the gender distribution from a list of clients.
 * @param {Array<object>} clients - An array of client objects, each with a 'gender' property.
 * @returns {object} An object with genders as keys and their counts as values.
 */
function calculateGenderDistribution(clients) {
  const genderDistribution = {
    masculino: 0,
    feminino: 0,
    outro: 0,
    "não informado": 0,
  };
  clients.forEach((client) => {
    const gender = (client.gender || "não informado").toLowerCase();
    if (genderDistribution.hasOwnProperty(gender)) {
      genderDistribution[gender]++;
    } else {
      genderDistribution["outro"]++;
    }
  });
  return genderDistribution;
}

module.exports = {
  calculateAgeDistribution,
  calculateGenderDistribution,
};
