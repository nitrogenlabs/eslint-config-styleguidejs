// Test TypeScript file
const foo : string = 'bar'; // This should no longer trigger the type-annotation-spacing rule

const test = () : void => {
  return;
};

interface Person {
  name : string;
  age : number;
}

type Animal = {
  species : string;
};