import { useState, useEffect } from "react";
import { deleteNote, updateNote, getSummary } from "../../data";
import { Layout, Flex, Input, Modal, Button, Popover } from "antd";
import GifSearch from "../Gifsearch";
import { GifOutlined, OpenAIOutlined } from "@ant-design/icons";

const { Content } = Layout;

const NoteBody = ({ note, setNote,setSliderNotesItems }) => {

  const [content, setContent] = useState(note?.content);
  const [selectedGifs, setSelectedGifs] = useState([]);
  const [isModalGPTOpen, setIsModalGPTOpen] = useState(false);
  const [isModalGIFOpen, setIsModalGIFOpen] = useState(false);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (note) {
      setContent(note.content);
    }
  }, [note])

  const handleGPTClick = async () => {
    try {
      const summarizedContent = await getSummary(content);
      setSummary(summarizedContent);
      setIsModalGPTOpen(true);
    } catch (error) {
      console.error("Error summarizing note:", error);
    }
  };

  function handleGifClick() {
    setIsModalGIFOpen(true);
  }

  function handleAddGif(gifs) {
    setSelectedGifs(gifs);
    setIsModalGIFOpen(false);
  }

  function handleDeleteNote() {
    if (note) {
      setSliderNotesItems((prev) => prev?.filter((n) => n?.key !== note.id));
      setNote(null);
      deleteNote(note.id);
    }
  }

  function handleSaveNote(noteId) {
    try {
      updateNote(noteId, note.title, content);
    } catch (err) {
      console.log("Error while updating note", err);
    }
  }

  function handleCancel() {
    setIsModalGIFOpen(false);
    setIsModalGPTOpen(false);
  }

  return (
    <Content
      className="content"
      style={{
        height: "calc(100vh - 120px)",
        padding: 24,
        overflow: "hidden",
      }}
    >
      <Flex style={{ height: "100%" }} gap="5px" vertical={true}>
        <Flex
          vertical={true}
          flex="50 1"
          gap="5px"
          style={{ overflowY: "auto" }}
        >
          <Input.TextArea
            id="content"
            placeholder="Enter Content"
            value={content}
            style={{ height: "100%" }}
            onChange={(x) => setContent(x.target.value)}
          />
          <Flex wrap>
            {selectedGifs.map((gif, index) => (
              <Image key={index} src={gif.images.fixed_width_small.url} />
            ))}
          </Flex>
        </Flex>

        <Flex justify="space-between">
          <Flex gap="small">
            <Popover content="Summarize using AI" trigger="hover">
              <Button icon={<OpenAIOutlined />} onClick={handleGPTClick} />
            </Popover>
            <Popover content="Add GIFs" trigger="hover">
              <Button onClick={handleGifClick} icon={<GifOutlined />} />
            </Popover>
          </Flex>
          <Flex gap="small">
            <Button color="danger" variant="solid" onClick={handleDeleteNote}>
              Delete
            </Button>
            <Button type="primary" onClick={() => handleSaveNote(note.id)}>
              Save
            </Button>
          </Flex>

          <GifSearch
            handleCancel={handleCancel}
            handleAddGif={handleAddGif}
          />

          <Modal
            open={isModalGPTOpen}
            onCancel={handleCancel}
            onOk={handleCancel}
          >
            <p> {summary}</p>
          </Modal>
        </Flex>
      </Flex>
    </Content>
  );
};

export default NoteBody;
