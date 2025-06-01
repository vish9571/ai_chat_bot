export const templates = {
  python: {
    "Hello World": "print('Hello World!')",
    "Simple Plot": `import matplotlib.pyplot as plt\nplt.plot([1,2,3],[4,5,6])\nplt.show()`,
    "Simple Loop": "for i in range(5):\n    print(i)"
  },
  r: {
    "Hello World": "print('Hello World!')",
    "ggplot2 Example": `library(ggplot2)\nggplot(mtcars, aes(mpg, wt)) + geom_point()`,
    "Histogram": "hist(mtcars$mpg)"
  }
};

export function getTemplates(language) {
  return templates[language];
}
