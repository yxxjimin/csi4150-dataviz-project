import { useState } from 'react'
import { ScrollDown, ScrollUp } from './components/ScrollButton';
import { GenreScatterPlot } from './components/GenreScatterPlot';
import { ScatterPlot } from './components/ScatterPlot';
import { PieChart } from './components/PieChart';
import { LineChart } from './components/LineChart';



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
    <div className='relative w-screen h-screen flex flex-col justify-around mb-20 space-y-6 font-display'>
      <div className='w-screen flex p-20'>
        <div className='w-2/5'>
        </div>
        <div className='w-3/5 flex flex-col space-y-6'>
          <h1 className="text-3xl font-bold">
            The Game Industry
          </h1>
          <p>세계 최대 규모의 게임 유통 플랫폼 ‘Steam' 가입자 수는 2020년 9월을 기점으로 3억 3700만명을 돌파하였다. 또한 같은 해 12월 기준으로는 최대 동시 접속자 수는 2640만명으로 집계되었다.</p>
          <p>이처럼 게임 업계의 소비층은 꾸준히 증가하고 있으며, 이에 발 맞춰 게임 시장도 그 규모가 증대되어 관련 산업도 굉장히 빠르게 발전하고 있다.</p>
        </div>
      </div>
      <div className='w-screen flex justify-around space-y-6 p-20'>
        <div className='w-3/5 flex flex-col space-y-6'>
          <h1 className="text-3xl font-bold">
            Metacritic Scores
          </h1>
          <p><span className='font-bold text-[#3858e4]'>Metacritic</span>은 게임 뿐만 아니라 음악, 영화 등 전세계의 다양한 미디어에 대한 평가 점수를 제공하는 플랫폼이다.</p>
          <p>PC, Nintendo Switch, Playstation 등 다양한 플랫폼의 게임들을 Metacritic의 <em>평론가 점수</em>를 기준으로 상위 125개 가량 추출하여 시각화하였다.</p>
          <p>본 프로젝트의 목적은 각 게임에 대한 평론가의 리뷰, 유저의 리뷰 등 다양한 판단 지표들을 사용자에게 시각적으로 보여주어 의사결정에 도움을 주는 것이다.</p>
        </div>
        <div className='w-2/5 flex justify-center items-center'>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Metacritic_M.png"
            alt="metacritic logo"
            style={{height: 200, width: 200}}
          />
        </div>
      </div>
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
      <GenreScatterPlot />
      <LineChart />
    </>
  )
};

export default App;
