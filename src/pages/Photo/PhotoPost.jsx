import React, { useState, useCallback, useEffect } from "react";
import GalleryFrame from "../../components/Photo/GalleryFrame";
import * as S from "./PhotoPoststyled";
import arrow from "../../assets/arrow.png";
import PhotoPlus from "./PhotoPlus";
import ReactModal from "react-modal";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { API } from "../../api";
import Category from "../../components/Photo/Category";

const PageStyle = createGlobalStyle`
  body {
    background-color: #F7F8FB;
    margin: 0;
    padding: 0;
    display: flex;
    width: 1440px;
    justify-content: center;
    align-items: center;
    height: fit-content;
  }
`;

const PhotoPost = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [photos, setPhotos] = useState([]); // 실제 사진 데이터
  const [filter, setFilter] = useState("all");
  const [folders, setFolders] = useState([]); // 기본 폴더 추가
  const [selectedFolder, setSelectedFolder] = useState("all");

  const navigate = useNavigate();

  const openModal = () => setModalIsOpen(true);
  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    navigate("/"); // 모달 닫힌 후 메인 페이지로 이동
  }, [navigate]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await API.get("/gallery/photos");
        console.log("photo 정보", response.data);
        setPhotos(response.data);
      } catch (error) {
        console.error("사진 get 실패", error);
      }
    };

    fetchPhotos();
  }, []);

  // 사진 필터링 함수
  const filteredPhotos = photos.filter(
    (photo) =>
      filter === "all" ||
      (filter === "favorites" && favorites.includes(photo.id)) ||
      (filter === "folder" && photo.folder === selectedFolder)
  );

  const handleLikeToggle = async (photoId) => {
    try {
      if (favorites.includes(photoId)) {
        const response = await API.delete(
          `/gallery/photos/${photoId}/unfavorite/`
        );
      } else {
        const response = await API.post(`/gallery/photos/${photoId}/favorite/`);
      }

      if (response && response.status === 200) {
        setFavorites((prevFavorites) =>
          favorites.includes(photoId)
            ? prevFavorites.filter((id) => id !== photoId)
            : [...prevFavorites, photoId]
        );
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Failed to update favorites:",
        error.response || error.message || error
      );
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PageStyle />
      <S.Margin onClick={openModal}>추가하기 +</S.Margin>
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        ariaHideApp={false}
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            padding: 0,
            border: "none",
            background: "none",
            overflow: "visible",
            position: "unset",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <PhotoPlus closeModal={closeModal} />
      </ReactModal>
      <S.All>
        <Category
          filter={filter}
          setFilter={setFilter}
          folders={folders}
          setFolders={setFolders}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
        />
        <S.Right>
          {filteredPhotos.map((photo) => (
            <GalleryFrame
              key={photo.id}
              image={photo.image}
              photoId={photo.id}
              onLikeToggle={handleLikeToggle}
              isLiked={favorites.includes(photo.id)}
              title={photo.title}
              detail={photo.detail}
              closeModal={closeModal}
            />
          ))}
        </S.Right>
      </S.All>
      <S.Arrow onClick={scrollToTop} src={arrow} alt="Sample"></S.Arrow>
    </div>
  );
};

export default PhotoPost;
