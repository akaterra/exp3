import React from "react";

export default (fn, isLoadedValue) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  if (isLoadedValue !== undefined) {
    setIsLoaded(isLoadedValue);
  }

  React.useEffect(() => {
    fn().then((result) => {
      setIsLoaded(true);

      return result;
    });
  }, [true]);
};
