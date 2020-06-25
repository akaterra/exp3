import React from "react";

export default (source, onLoading, onLoaded, onError, isLoadedValue) => {
  const [_, setIsLoaded] = React.useState(false);

  if (isLoadedValue !== undefined) {
    setIsLoaded(isLoadedValue);
  }

  React.useEffect(() => {
    if (onLoading) {
      onLoading();
    }

    const result = source();

    if (result instanceof Promise) {
      result.then((result) => {
        setIsLoaded(true);
  
        if (onLoaded) {
          onLoaded();
        }
  
        return result;
      }).catch((e) => {
        setIsLoaded(true);
  
        if (onError) {
          onError();
        }
  
        return Promise.reject(e);
      });
    } else {
      setIsLoaded(true);

      if (onLoaded) {
        onLoaded();
      }
    }
  }, [true]);
};
