import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  Button,
  Layout,
  ConfigProvider,
  Flex,
  Spin,
} from "antd";
import {
  subscribeNote,
  subscribeTag,
  subscribeNoteTag,
  fetchNotes,
  fetchTags,
  fetchNoteTags,
} from "./data";
import NoteContent from "@/components/note-content/NoteContent";
import themeA from "./themeBuilder.json";
import themeB from "./themeBuilder2.json";
import MenuTags from "./components/MenuTags";
import MenuNotes from "./components/MenuNotes";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [noteTags, setNoteTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderNotesItems, setSliderNotesItems] = useState([]);
  const [note, setNote] = useState(null);

  const [currentTheme, setCurrentTheme] = useState(themeA);

  const { Sider, Footer } = Layout;
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
        setSliderNotesItems([
          ...fetchedNotes.data.map((note) => ({
            key: note.id,
            label: note.title,
          })),
          {
            key: "ADD",
            icon: <PlusOutlined />,
            label: "Add a new note",
          },
        ]);
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

  function handleTheme() {
    setCurrentTheme((prev) => (prev === themeA ? themeB : themeA));
  }

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
                overflow: "hidden",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              <MenuTags tags={tags} noteTags={noteTags} notes={notes} setSliderNotesItems={setSliderNotesItems} setTags={setTags} />
            </Sider>
            <Sider
              style={{
                height: "100%",
              }}
            >
              <MenuNotes notes={notes} setNote={setNote} sliderNotesItems={sliderNotesItems} setSliderNotesItems={setSliderNotesItems} />
            </Sider>

            <NoteContent
              note={note}
              tags={tags}
              noteTags={noteTags}
              setSliderNotesItems={setSliderNotesItems}
            />

          </Layout>

          <Footer>
            <Flex style={{ gap: "5px" }}>
              <Button onClick={signOut}> Sign out </Button>
              <Button
                icon={
                  currentTheme === themeA ? <MoonOutlined /> : <SunOutlined />
                }
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
