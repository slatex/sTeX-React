import { useState } from "react";
import { FTMLDocument, FTMLFragment } from "./documents";


export const TestDocument = () => {
  return <FTMLDocument 
    opt={{
      uri:"https://stexmmt.mathhub.info/:sTeX?a=sTeX/MathTutorial&d=textbook&l=en",
      toc:"GET"
    }}
    onSectionBegin={(uri:string) => {
      return <SectionStart sec={uri}/>
    }}
    onSectionEnd={(_:string) => {
      return <SectionEnd/>
    }}
  />
}

export const TestFragmentA = () => {
  return <>
    <p>Multiple Choice:</p>
    <FTMLFragment opt={{uri:"https://stexmmt.mathhub.info/:sTeX?a=sTeX/DemoExamples&d=problemtest&l=en&e=exercise_1"}}/>
  </>
}

export const TestFragmentB = () => {
  return <>
    <p>Fillinsol (logs typing):</p>
    <FTMLFragment 
      opt={{uri:"https://stexmmt.mathhub.info/:sTeX?a=sTeX/DemoExamples&d=problemtest&l=en&e=exercise_3"}}
      ex={{onEvent:(ev) => console.log(ev)}}
    />
  </>
}

export const SectionStart: React.FC<{sec:string}> = ({sec}) => {
  return <div style={{textAlign:"center"}}>
    <p>This is the start of a section: {sec}!</p>
    <Click/>
  </div>
}
export const SectionEnd: React.FC<{}> = ({}) => {
  return <div style={{textAlign:"center"}}>
    <p>This is the end of a section!</p>
  </div>
}


const Click: React.FC = () => {
  const [count, setCount] = useState(0)
  return <>
    <button onClick={() => setCount((count) => count + 1)}>
      count is {count}
    </button>
    <p>
      Edit <code>src/App.tsx</code> and save to test HMR
    </p>
  </>
}