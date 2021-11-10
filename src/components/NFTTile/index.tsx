import React, { useState } from "react";
import Link from "next/link";

type NFTTileProps = {
  id: string;
  imgSrc: string;
  name: string;
};

const NFTTile: React.FC<NFTTileProps> = ({ id, imgSrc, name }) => {
  const [isLoaded, setIsLoaded] = useState<Boolean>(false);

  const onLoad = () => {
    console.log("loaded");
    setIsLoaded(true);
  };

  return (
    <div className="w-1/5 h-64 bg-pink-500 mx-4 my-4 gradient fadeInAnimation relative flex overflow-hidden justify-center items-center shadow-lg rounded-2xl tilecontainer">
      <img
        style={{ display: isLoaded ? "block" : "none" }}
        onLoad={onLoad}
        src={imgSrc}
        className=" flex-shrink-0 min-w-full min-h-full object-cover"
      />
      <div className="details absolute flex flex-col justify-around h-full w-full text-white">
        <p className="text-xl font-bold text-center">{name}</p>

        <button className="uppercase">
          <Link href={`/details/${id}`}>
            <p>Details</p>
          </Link>
        </button>
      </div>
    </div>
  );
};

export default NFTTile;
