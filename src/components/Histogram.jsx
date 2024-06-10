

export const Histogram = () => {
  return (
    <div className="relative w-screen text-center flex justify-between items-center space-y-6 space-x-6 my-40 px-20 font-display">
      <div className="w-1/2 flex">
        <img 
          src="/csi4150-dataviz-project/histogram.png" 
          alt="histogram" 
          // style={{width: 200}}
        />
      </div>
      <div className="w-1/2 flex flex-col text-left space-y-4">
        <h2 className="text-lg font-bold mb-2">* Top 125 게임의 연도별 분포</h2>
        <p>좋은 평가를 받은 게임의 수가 급격히 증가하거나 감소하는 시기가 있습니다. 특히 2017~2019년에 수가 급증하였고, 이는 게임 산업의 급성장 시기를 나타냅니다.</p>
      </div>
    </div>
  );
};
