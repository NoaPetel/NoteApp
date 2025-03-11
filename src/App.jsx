import React, { useEffect, useState } from "react";
import {
  AlignCenterOutlined,
  TagOutlined,
  PlusOutlined,
  MoonOutlined,
  SunOutlined,
  GifOutlined,
  OpenAIOutlined,
} from "@ant-design/icons";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  Button,
  Modal,
  Input,
  Layout,
  Menu,
  ConfigProvider,
  theme,
  Flex,
  Spin,
  Card,
  Image,
} from "antd";
import {
  createNote,
  createTag,
  createNoteTag,
  deleteNote,
  deleteTag,
  subscribeNote,
  subscribeTag,
  subscribeNoteTag,
  fetchNotes,
  fetchTags,
  fetchNoteTags,
  updateNote,
} from "./data";
import themeA from "./themeBuilder.json";
import themeB from "./themeBuilder2.json";
import GifSearch from "./components/Gifsearch";
import summarizeNote from "./services/openaiService";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [noteTags, setNoteTags] = useState([]);
  const [selectedGifs, setSelectedGifs] = useState([]);
  const [sliderNotesItems, setSliderNotesItems] = useState([]);
  const [sliderTagsItems, setSliderTagsItems] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState("");

  const [isLightTheme, setIsLightTheme] = useState(true);
  const [modalSelectedTags, setModalSelectedTags] = useState([]);
  const [IsModalAddTagToNoteOpen, setIsModalAddTagToNoteOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalGIFOpen, setIsModalGIFOpen] = useState(false);
  const [isModalTagsOpen, setIsModalTagsOpen] = useState(false);
  const [isModalGPTOpen, setIsModalGPTOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagTitle, setTagTitle] = useState("");
  const [note, setNote] = useState();

  const [currentTheme, setCurrentTheme] = useState(themeA);

  const { Header, Sider, Content, Footer } = Layout;
  const { signOut } = useAuthenticator();

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [fetchedNotes, fetchedTags, fetchedNoteTags] = await Promise.all([
          fetchNotes(),
          fetchTags(),
          fetchNoteTags(),
        ]);

        const noteSubscription = subscribeNote(setNotes);
        const tagSubscription = subscribeTag(setTags);
        const noteTagSubscription = subscribeNoteTag(setNoteTags);

        setNotes(fetchedNotes.data);
        setTags(fetchedTags.data);
        setNoteTags(fetchedNoteTags.data);
        return () => {
          noteSubscription.unsubscribe();
          tagSubscription.unsubscribe();
          noteTagSubscription.unsubscribe();
        };
      } catch (err) {
        console.error("Error while fetching data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  const items1 = [
    {
      key: "1",
      icon: <AlignCenterOutlined />,
      label: "Notes",
    },
    {
      key: "tags",
      icon: <TagOutlined />,
      label: "Tags",
      children: [
        ...tags.map((tag) => ({
          key: tag.id,
          label: tag.title,
        })),
        {
          key: "ADD",
          icon: <PlusOutlined />,
          label: "Add a tag",
        },
      ],
    },
  ];

  const handleNoteClick = (item) => {
    if (item.key === "ADD") {
      setIsModalOpen(true);
    } else {
      const clickedNote = notes.find((n) => n.id === item.key);
      if (clickedNote) {
        setNote(clickedNote);
        setTitle(clickedNote?.title || "");
        setContent(clickedNote?.content || "");

        const modalSelectedTag = noteTags
          .filter((nt) => nt.noteId === item.key)
          .map((nt) => nt.tagId);
        setModalSelectedTags(modalSelectedTag);
      }
    }
  };

  const handleMenuClick = (tagMenu) => {
    if (tagMenu.key === "ADD") {
      setIsModalTagsOpen(true);
    } else {
      const selectedNotesTags = noteTags.filter(
        (nt) => nt.tagId === tagMenu.key
      );
      const selectedNoteIds = selectedNotesTags.map((nt) => nt.noteId);
      let selectedNotes = notes.filter((n) => selectedNoteIds.includes(n.id));
      if (!(selectedNotes.length > 0)) selectedNotes = [];
      if (tagMenu.key === "1") selectedNotes = notes;
      const menuItems = selectedNotes.map((note) => ({
        key: note.id,
        label: note.title,
      }));
      const newMenuItems = [
        ...menuItems,
        {
          key: "ADD",
          icon: <PlusOutlined />,
          label: "Add a new note",
        },
      ];
      setSliderNotesItems(newMenuItems);
    }
  };

  function handleCancel() {
    console.log("Cancel");
    setIsModalOpen(false);
    setIsModalAddTagToNoteOpen(false);
    setIsModalTagsOpen(false);
    setIsModalGIFOpen(false);
    setIsModalGPTOpen(false);
  }

  function handleCreateNote() {
    createNote(title, content)
      .then((response) => {
        if (response.data) {
          const newNote = response.data;
          setSliderNotesItems((prevValue) => [
            {
              key: newNote.id,
              label: newNote.title,
            },
            ...prevValue,
          ]);

          setTitle(title);
          setContent("");
          setIsModalOpen(false);
        }
      })
      .catch((err) => console.error("Error while creating the notes", err));
  }

  function handleCreateTag() {
    createTag(tagTitle)
      .then((response) => {
        if (response.data) {
          const newTag = response.data;
          setTags((prevValue) => [
            {
              key: newTag.id,
              label: newTag.title,
            },
            ...prevValue,
          ]);

          setTitle("");
          setContent("");
          setIsModalTagsOpen(false);
        }
      })
      .catch((error) => console.log("Error while creating the notes", error));
  }

  function handleDeleteNote() {
    if (note) {
      setSliderNotesItems((prev) => prev?.filter((n) => n?.key !== note.id));
      deleteNote(note.id);
      setTitle("");
      setContent("");
    }
  }

  function applyFiltersOnTag(tag) {
    const tagIds = noteTags
      .filter((nt) => nt.noteId === note?.id)
      .map((nt) => nt.tagId);
    return tagIds.includes(tag.id);
  }

  function handleAddTagToNote() {
    setIsModalAddTagToNoteOpen(true);
  }

  function handleAddTags() {
    if (modalSelectedTags.length > 0 && note) {
      modalSelectedTags.forEach((t) => {
        if (!noteTags.find((nt) => nt.tagId === t && nt.noteId == note.id)) {
          createNoteTag(note.id, t);
        }
      });
    }

    noteTags.forEach((nt) => {
      if (nt.tagId && note) {
        if (nt.noteId === note.id && !modalSelectedTags.includes(nt.tagId)) {
          deleteTag({ id: nt.id });
        }
      }
    });

    setModalSelectedTags([]);
    setIsModalAddTagToNoteOpen(false);
  }

  function handleModalSelectTag(tagId) {
    setModalSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  }

  function handleTheme() {
    setCurrentTheme((prev) => (prev === themeA ? themeB : themeA));
  }

  function handleSaveNote(noteId) {
    try {
      updateNote(noteId, title, content);
    } catch (err) {
      console.log("Error while updating note", err);
    }
  }

  function handleGifClick() {
    setIsModalGIFOpen(true);
  }

  function handleAddGif(gifs) {
    console.log("gifs", gifs);
    setSelectedGifs(gifs);
    setIsModalGIFOpen(false);
  }
  const handleGPTClick = async () => {
    try {
      const summarizedContent = await summarizeNote(content);
      setSummary(summarizedContent);
      setIsModalGPTOpen(true);
    } catch (error) {
      console.error("Error summarizing note:", error);
    }
  };

  if (isLoading) {
    return (
      <Flex
        style={{ width: "98vw", heigh: "100vh" }}
        align="center"
        justify="center"
      >
        <Spin size="large" />
      </Flex>
    );
  } else {
    return (
      <ConfigProvider theme={currentTheme}>
        <Layout style={{ height: "100vh", width: "100vw" }}>
          <Layout>
            <Sider
              style={{
                height: "100%",
                borderRight: "2px solid #d1d1d1",
                overflow: "hidden",
                overflowY: "auto",
                scrollbarWidth: "thin",
              }}
            >
              <Menu
                className="main_slider"
                style={{
                  overflow: "hidden",
                  overflowY: "auto",
                }}
                mode="inline"
                defaultSelectedKeys={["1"]}
                items={items1}
                onClick={handleMenuClick}
              />
              <Modal
                title="Tag"
                open={isModalTagsOpen}
                onOk={handleCreateTag}
                onCancel={handleCancel}
              >
                <Input
                  id="title"
                  placeholder="Enter title"
                  value={tagTitle}
                  onChange={(x) => setTagTitle(x.target.value)}
                />
              </Modal>
            </Sider>
            <Sider
              style={{
                height: "100%",
              }}
            >
              <Menu
                mode="inline"
                style={{ height: "100%" }}
                defaultSelectedKeys={["1"]}
                items={sliderNotesItems}
                onClick={handleNoteClick}
              />
            </Sider>
            <Modal
              title="Note"
              open={isModalOpen}
              onOk={handleCreateNote}
              onCancel={handleCancel}
            >
              <Input
                id="title"
                placeholder="Enter title"
                value={title}
                onChange={(x) => setTitle(x.target.value)}
              />
            </Modal>
            {note ? (
              <Layout>
                <Header
                  style={{
                    padding: "24px",
                  }}
                >
                  <Flex
                    vertical={true}
                    wrap="wrap"
                    style={{
                      width: "100%",
                      gap: "5px",
                    }}
                  >
                    <Input
                      id="title"
                      placeholder="Enter title"
                      value={title}
                      onChange={(x) => setTitle(x.target.value)}
                    />
                    <Flex
                      style={{
                        alignItems: "center",
                        width: "100%",
                        height: "32px",
                        gap: "5px",
                        overflow: "hidden",
                        overflowX: "scroll",
                        scrollbarWidth: "none",
                      }}
                    >
                      <PlusOutlined onClick={handleAddTagToNote} />
                      {tags
                        .filter((tag) => applyFiltersOnTag(tag))
                        .map((tag) => (
                          <Button
                            style={{ minWidth: "70px", width: "50px" }}
                            key={tag.id}
                          >
                            {tag.title}
                          </Button>
                        ))}
                    </Flex>
                    <Modal
                      title="tags"
                      open={IsModalAddTagToNoteOpen}
                      onOk={handleAddTags}
                      onCancel={handleCancel}
                    >
                      {tags.map((tag) => (
                        <Button
                          color="red"
                          variant={
                            modalSelectedTags.includes(tag.id)
                              ? "solid"
                              : "text"
                          }
                          key={tag.id}
                          onClick={() => handleModalSelectTag(tag.id)}
                        >
                          {tag.title}
                        </Button>
                      ))}
                    </Modal>
                  </Flex>
                </Header>

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
                          <Image
                            key={index}
                            src={gif.images.fixed_width_small.url}
                          />
                        ))}
                      </Flex>
                    </Flex>

                    <Flex gap="5px" justify="end">
                      <Button
                        icon={<OpenAIOutlined />}
                        onClick={handleGPTClick}
                      />
                      <Button onClick={handleGifClick} icon={<GifOutlined />} />

                      <Button
                        color="danger"
                        variant="solid"
                        onClick={handleDeleteNote}
                      >
                        {" "}
                        Delete{" "}
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => handleSaveNote(note.id)}
                      >
                        {" "}
                        Save{" "}
                      </Button>

                      <GifSearch
                        isModalOpen={isModalGIFOpen}
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
              </Layout>
            ) : null}
          </Layout>
          <Footer>
            <Flex style={{ gap: "5px" }}>
              <Button onClick={signOut}> Sign out </Button>
              <Button
                icon={isLightTheme ? <MoonOutlined /> : <SunOutlined />}
                onClick={handleTheme}
              />
            </Flex>
          </Footer>
        </Layout>
      </ConfigProvider>
    );
  }
};

export default App;
