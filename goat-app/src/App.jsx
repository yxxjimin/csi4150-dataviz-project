import { useState } from 'react'
import { ScrollDown, ScrollUp } from './components/ScrollButton';
import { GenreScatterPlot } from './components/GenreScatterPlot';
import { ScatterPlot } from './components/ScatterPlot';
import { PieChart } from './components/PieChart';



// Pages
const OnBoarding = () => {
  return (
    <div className='relative w-screen h-screen text-center flex flex-col justify-center items-center space-y-6 font-display'>
      <h1 className='font-bold'>Greatest Games of All Time</h1>
      <h2 className='font-semibold text-xl'>Game Data Visualizer</h2>
      <ScrollDown />
    </div>
  );
};


const Intro = () => {
  return (
    <div className='relative w-screen h-screen text-center flex flex-col justify-center items-center space-y-6 font-display'>
      <h1 className="text-3xl font-bold">
        뭐라고하지
      </h1>
      <p>
        게임의 역사는 끊임없이 발전하는 컴퓨터 그래픽스 기술과 창의적인 스토리텔링, 그리고 연출 기법의 발전으로 지속적으로 문화적, 기술적 영향력을 키워나가고 있습니다. 본 프로젝트에서는 가장 영향력 있는 게임들을 선정하고, 각 게임들에 대한 평론가들의 리뷰와 유저들의 리뷰 등 다양한 평가 지표들을 사용자들에게 시각적으로 보여주는 것을 목표로 합니다.
      </p>
    </div>
  );
};


const App = () => {

  return (
    <>
      <OnBoarding />
      <Intro />
      <ScatterPlot />
      <PieChart />
    </>
  )
};

export default App;
