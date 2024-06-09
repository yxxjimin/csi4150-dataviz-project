const height = window.innerHeight;

const scrollNext = () => {
  window.scrollBy({
    top: height,
    left: 0,
    behavior: 'smooth',
  });
};

const scrollPrev = () => {
  window.scrollBy({
    top: -height,
    left: 0,
    behavior: 'smooth',
  });
}

export const ScrollDown = () => {
  return (
    <button 
      className='absolute bottom-6'
      onClick={scrollNext}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
      </svg>
    </button>
  );
};

export const ScrollUp = () => {
  return (
    <button
      className='absolute top-6'
      onClick={scrollPrev}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  )
}
