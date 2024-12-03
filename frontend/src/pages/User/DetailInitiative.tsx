import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Initiative } from "../../store/Initiatives/showInitiativesSlice";
import {  likeIcon, shareIcon , dislikeIcon, close} from "../../assets";
import DetailedGraph from "../../components/graf/Graph";
import { useAppKitAccount } from "@reown/appkit/react";
import { sendJoinLeave, sendLikeDislike, sendShare } from "../../store/Initiatives/joinLikesIniSlice";
import { toast } from "react-toastify";
import { AppDispatch } from "../../store/store";
import ModalBuy from "../../components/buyInit/modalBuy";
import useWindowSize from "../../components/hooks/Responsive";
const URL_DEL_FRONT = import.meta.env.URL_DEL_FRONT;

const Detail = () => {
  const { id } = useParams();
  const { initiatives } = useSelector((state: RootState) => state.initiatives);  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const joinedInitiatives = useSelector((state: RootState) => state.joinInitiatives.joinedInitiatives);
  const likedInitiatives = useSelector((state: RootState) => state.likeInitiatives.likedInitiatives);
  const { isConnected } = useAppKitAccount();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [initiativeDetail, setInitiativeDetail] = useState<Initiative | null | undefined>(null);
  const { width } = useWindowSize();

  const isMobile = width <= 768;

  const handleBuy = (initiative: Initiative) => {
    setSelectedInitiative(initiative);  
    setIsModalOpen(true);              
  };
  
  function handleJoin(id: string) {
    const { isJoined } = checkIfLikeOrJoined(id); 
    if (isJoined) {
      dispatch(sendJoinLeave({ initiativeId: id, isJoined: false }));
    } else {
      dispatch(sendJoinLeave({ initiativeId: id, isJoined: true }));
    }
  }
  
  function handleLike(id: string) {
    const { isLiked } = checkIfLikeOrJoined(id); 

    if (isLiked) {
      dispatch(sendLikeDislike({ initiativeId: id, isLiked: false }));
    } else {
      dispatch(sendLikeDislike({ initiativeId: id, isLiked: true }));

    }
  }
  
  const checkIfLikeOrJoined = (
    id: string,
  ): { isLiked: boolean; isJoined: boolean } => {
    const isLiked = likedInitiatives.includes(id);
    const isJoined = joinedInitiatives.includes(id);
    return { isLiked, isJoined };
  };
  
  const { isLiked, isJoined } = initiativeDetail
  ? checkIfLikeOrJoined(initiativeDetail.id)
  : { isLiked: false, isJoined: false };


  const handleShare = (id: string) => {
    const initiativeUrl = `${URL_DEL_FRONT}/initiatives/${id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Check this initiative!',
        url: initiativeUrl,
      });
      dispatch(sendShare({isShare:true, initiativeId:id}))

    } else {
      toast.warning('Share API is not supported on this device.');
    }
  };
  
  const handleBack = () => {
    navigate(-1); 
  };
  
useEffect(() => {
  if (id && initiatives.length > 0) {
    const initiative = initiatives.find((item) => item.id === id);
    setInitiativeDetail(initiative);
  }
}, [id, initiatives, likedInitiatives, joinedInitiatives]);

  if (!initiativeDetail) {
    return <div>Cargando...</div>; 
  }


  return (
    <div className="flex flex-col bg-[#afafaf1a] gap-2 p-1">
        {isModalOpen && selectedInitiative && <ModalBuy initiative={selectedInitiative} onClose={() => setIsModalOpen(false)} />}
        {isMobile 
        // **-*-*-*-*-*-*-*-*-*-*-*-*-*-*- Mobil*-*-*-*-*-*-*-**-*-*-*-*-
        ? <>
        </>
        // **-*-*-*-*-*-*-*-*-*-*-*-*-*-*- WebApp*-*-*-*-*-*-*-**-*-*-*-*-
        : <><div className="flex flex-row gap-2 justify-between m-auto ">
            <div className=" flex flex-row justify-between m-3 bg-white rounded-lg shadow">  
                <div className="w-[330px] m-auto mr-4">
                  <img src={initiativeDetail.logo}
                  alt={initiativeDetail.name}
                  className=" w-[250px] h-[250px] p-4 m-auto mr-6"
                  />
                  </div>  
                <div className=" flex flex-col gap-2 w-[600px] m-auto">
                <h1 className="text-3xl font-semibold mb-4 text-color-5 text-center mr-4">{initiativeDetail.name}</h1>
                    <div><h2 className="text-l italic font-semibold">Problema:</h2> 
                    <p className="m-1">{initiativeDetail.problem}</p></div>
                    <div><h2 className="text-l italic font-semibold">Oportunidad:</h2> <p className="m-1">{initiativeDetail.opportunity}</p></div>
                    <div><h2 className="text-l italic font-semibold">Solución:</h2> <p className="m-1">{initiativeDetail.solution}</p></div>
                    <div><h2 className="text-l italic font-semibold">idea:</h2> <p  className="m-1">{initiativeDetail.idea}</p></div>
                </div>
                
            </div>

            <div className="m-auto flex flex-col">
                    <button 
                    className="text-xl font-semibold mb-1 items-center justify-items-end"
                    onClick={handleBack}
                    ><img src={close} className="w-[35px]"/></button>
                    <div className="bg-white rounded-lg shadow p-2 flex flex-col gap-3 m-3">
                        <div>
                          <h2 className="text-l italic font-semibold text-center">Colaboradores:</h2><p className="bg-[#00B2FF]/20 rounded-lg p-1 w-[73px] text-center m-auto text-sm p-1"> {initiativeDetail.colaborator}</p></div>
                        <div><h2 className="text-l italic font-semibold text-center">Misiones:</h2><p  className="text-center m-auto text-sm p-1"> {initiativeDetail.missions}</p></div>
                        <div><h2 className="text-l italic font-semibold text-center">Likes:</h2><p  className="text-center m-auto text-sm p-1"> {initiativeDetail.likes}</p></div>
                        <div><h2 className="text-l italic font-semibold text-center">Shares:</h2><p  className="text-center m-auto text-sm p-1"> {initiativeDetail.shares}</p></div>
                    </div>
            </div>

        </div>

        <div className="flex  flex-row  justify-center gap-6">
                <div className="bg-white rounded-lg shadow p-1 flex flex-row  justify-evenly gap-8">

                    <div className="">
                        <h2  className="text-l italic font-semibold text-center">Valores Históricos:</h2> 
                            <DetailedGraph priceFluctuation={initiativeDetail.priceFluctuation}/>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 p-2">
                            <div className="flex flex-col items-center">
                                <h2  className="text-l italic font-semibold text-center">Precio de venta:</h2> 
                                <p className="m-3">${initiativeDetail.sell_price}</p>
                                
                            </div>

                            <div className="flex flex-col items-center">
                                <h2  className="text-l italic font-semibold text-center">Precio de Compra:</h2> 
                                <p className="m-3">${initiativeDetail.buy_price}</p>
                                
                            </div>

                            <button className="text-sm italic bg-[#A9A9A9]/80 text-white p-1 rounded-lg shadow">Actualizar</button>

                    </div>
                    
                </div>
                <div className="flex flex-col justify-center gap-4 rounded-lg shadow bg-white m-1 ">

                      <div className="flex flex-col  w-[400px]  p-1" >
                        <h1 className="text-center font-semibold text-l">¿Quieres apoyar esta iniciativa?</h1>
                        <h1 className="text-center italic">Puedes participar en ella y formar parte de ella!</h1>
                        <div className="flex flex-row justify-evenly p-2">
                          {isConnected
                          ? <button 
                          className="bg-[#00B2FF] text-white justify-center p-2 rounded-full w-[54px] h-[34px] flex items-center shadow-lg"
                          onClick={() => handleBuy(initiativeDetail)} 
                          >Buy</button>
                  
                          :<button 
                          className="bg-[#E0E0E0] text-black p-2  justify-center rounded-full w-[54px] h-[34px] flex items-center shadow-lg"
                          onClick={()=>{toast.info('Please connect the wallet first')}}
                          >Buy</button>
                          }

                          {
                            isJoined
                            ?<button 
                            className="bg-[#E0E0E0] text-white p-2 justify-center rounded-full w-[54px] h-[34px] flex items-center shadow-lg"
                            onClick={()=>handleJoin(initiativeDetail.id)}
                            >Join</button> 
                            :<button 
                            className="bg-color-1 text-white p-2  justify-center rounded-full w-[54px] h-[34px] flex items-center shadow-lg"
                            onClick={()=>handleJoin(initiativeDetail.id)}
                            >Join</button>
                          }
                        </  div>

                      </div>
                        <div  className="flex flex-col w-[400px] p-2 ">
                          <h1 className="text-center font-semibold text-l">¿Te gustó esta iniciativa?</h1>
                          <h1 className="text-center italic">Ayudarias mucho compartiendola y dandole like</h1>
                          <div className="flex flex-row justify-evenly p-2">
                            <button 
                            className="m-2"
                            onClick={()=>handleLike(initiativeDetail.id)}
                            ><img src={isLiked ? likeIcon: dislikeIcon} className="h-[20px]"/>
                            </button>
                            <button className="m-2"
                            onClick={()=>handleShare(initiativeDetail.id)}
                            ><img src={shareIcon} className="h-[20px]"/>
                            </button>
                        </ div>
                      </div>
                    </div>
        
        </div>
        </>}
  </div>
  );
};

export default Detail;
