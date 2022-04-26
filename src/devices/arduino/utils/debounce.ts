

export function debounce_leading(_this:any, func:Function, timeout = 30){
    let timer:NodeJS.Timeout;
    return (...args:any) => {
      if (!timer) {
        console.log('call');
        func.apply(_this, args);
      }else{
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = undefined;
        console.log('clear');
      }, 30);
    };
  }