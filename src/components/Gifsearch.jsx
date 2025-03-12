import { useState } from "react";
import { Button, Input, Flex, Image, Modal, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { fetchGifs } from "../data";

const GifSearch = ({
  isModalOpen,
  handleCancel,
  handleAddGif,
}) => {
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [selectedGifs, setSelectedGifs] = useState([]);

  const handleSearch = async () => {
    try {
      const results = await fetchGifs(search);
      setGifs(results.data);
    } catch (err) {
      console.error("Error while searching for GIFs", err);
    }
  };

  const handleOnClick = (gif) => {
    if (!selectedGifs.includes(gif)) {
      setSelectedGifs((prev) => [...prev, gif]);
    } else {
      setSelectedGifs((prev) =>
        prev.includes(gif) ? prev.filter((url) => url !== gif) : [...prev, gif]
      );
    }
  };

  return (
    <>
      <Modal open={isModalOpen} onCancel={handleCancel} onOk={() => handleAddGif(selectedGifs)}>
        <Flex
          vertical={true}
          gap="small"
          align="center"
          style={{ padding:"5px 20px", height: "400px", scrollbarWidth: "thin" }}
        >

            <Input.Search
              type="text"
              placeholder="Search for GIFs..."
              value={search}
              onChange={(x) => setSearch(x.target.value)}
              onSearch={handleSearch}
            />


          <Flex
            wrap
            gap="small"
            justify="center"
            style={{ overflow: "auto", overflowY: "auto" }}
          >
            {gifs.map((gif) => (
              <Card
              key={gif.id}
                style={{
                  backgroundColor: selectedGifs.includes(gif)
                    ? "red"
                    : "white",
                }}
                onClick={() => {
                  handleOnClick(gif);
                }}
              >
                <Image title={gif.title} src={gif.url} />
              </Card>
            ))}
          </Flex>
        </Flex>
      </Modal>
    </>
  );
};

export default GifSearch;
