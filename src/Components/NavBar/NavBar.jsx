import React, { useState, useEffect } from "react";
import {
  AppBar,
  Typography,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Box from "@mui/material/Box";
import librant from "../../assets/img/logo.png";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import "regenerator-runtime/runtime";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./style.css";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import MicNoneIcon from "@mui/icons-material/MicNone";
import { auth } from "../../firebase";
import { getDatabase, ref, onValue } from "firebase/database";
import { useHistory, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import DrawerComponent from "./DrawerComponent";

//for the usernav
import Avatar from "@mui/material/Avatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Help } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import Dashboard from "@mui/icons-material/Dashboard";
import "./style.css";
import cookies from "../../cookies/Cookies";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useTranslation } from "react-i18next";
import { button } from "@material-tailwind/react";

const NavBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const [anchorEllang, setAnchorEllang] = React.useState(null);
  const [search, setsearch] = useState(false); //change thsi
  const open = Boolean(anchorEl);
  const open1 = Boolean(anchorEl2);
  const open2 = Boolean(anchorEllang);
  const theme = useTheme();
  const [searchbook, setsearchbook] = useState(null);
  const [loading, setloading] = useState(true);
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [categories, setcategories] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [t, i18n] = useTranslation();
  var date = new Date();
  var newDate = new Date(date.setMonth(date.getMonth() + 2));

  //voice recognition stuff
  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickUser = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClickLang = (event) => {
    setAnchorEllang(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAnchorEl2(null);
    setAnchorEllang(null);
  };

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "m") {
        // Perform the same action as clicking the button
        document.getElementById("myButton").click();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const bookRef = ref(getDatabase(), "books");
    const unsubscribe = onValue(bookRef, (snapshot) => {
      const data = snapshot.val();
      const bookArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      const uniqueCategories = [
        ...new Set(bookArray.flatMap((book) => book.categories)),
      ];
      setcategories(uniqueCategories);
    });
    return unsubscribe;
  }, []);

  const showSearchMenu = () => {
    if (search === true) {
      setsearch(false);
      document.body.style.overflow = "auto"; // enable scrolling
    } else {
      setsearch(true);
      document.body.style.overflow = "hidden"; // disable scrolling
    }
  };

  //this check for the user and show his infos
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, fetch user data
        const db = getDatabase();
        const userDataRef = ref(db, `users/${user.uid}`);
        onValue(userDataRef, (snapshot) => {
          const data = snapshot.val();
          setUser(data);
        });
      } else {
        // User is signed out
        setUser(null);
      }
    });

    // Unsubscribe from the listener when the component is unmounted
    return unsubscribe;
  }, []);

  //this check for the user and show his infos
  const [Books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        if (searchbook != null) {
          // User is signed in, fetch user data
          const db = getDatabase();
          const bookRef = ref(db, "books");
          onValue(bookRef, (snapshot) => {
            const data = snapshot.val();
            const bookArray = Object.keys(data)
              .filter((key) =>
                data[key].title.toLowerCase().includes(searchbook.toLowerCase())
              )
              .map((key) => ({ id: key, ...data[key] }))
              .slice(0, 5);
            setBooks(bookArray);
            setloading(false);
          });
        } else {
          // User is signed in, fetch user data
          const db = getDatabase();
          const bookRef = ref(db, `books`);
          onValue(bookRef, (snapshot) => {
            const data = snapshot.val();
            const bookArray = Object.keys(data)
              .map((key) => ({
                id: key,
                ...data[key],
              }))
              .slice(0, 5);
            console.log(bookArray);
            setBooks(bookArray);
            setloading(false);
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchBooks();
  }, [searchbook]);

  //sign the user out of the application
  const history = useHistory();

  const location = useLocation();
  const { pathname } = location;

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Redirect the user to the login page after successful sign-out
        history.push("/login");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handelCatChange = ({ e, category }) => {
    e.preventDefault();
    history.push(`/genres/${encodeURIComponent(category)}`);
  };

  const changeLanguage = ({ lang }) => {
    cookies.remove("lang");
    cookies.set("lang", lang, { path: "/", expires: newDate });
    i18n.changeLanguage(cookies.get("lang"));
    document.documentElement.lang = lang;
  };

  const randomColor = (char) => {
    const colorMap = {
      A: "#e91e63",
      B: "#9c27b0",
      C: "#673ab7",
      D: "#3f51b5",
      E: "#2196f3",
      F: "#00bcd4",
      G: "#009688",
      H: "#4caf50",
      I: "#8bc34a",
      J: "#cddc39",
      K: "#ffeb3b",
      L: "#ffc107",
      M: "#ff9800",
      N: "#ff5722",
      O: "#795548",
      P: "#607d8b",
      Q: "#009688",
      R: "#4caf50",
      S: "#8bc34a",
      T: "#cddc39",
      U: "#ffeb3b",
      V: "#ffc107",
      W: "#ff9800",
      X: "#ff5722",
      Y: "#795548",
      Z: "#607d8b",
    };

    const charUpper = char.toUpperCase();
    return colorMap[charUpper] || null; // return the color for the given character, or null for invalid input
  };

  useEffect(() => {
    if (listening) {
      setsearchbook(transcript);
    }
  }, [listening, transcript]);

  return (
    <>
      <div
        id="search-container"
        className={search ? "block z-50 fixed" : "hidden"}
      >
        <div
          onClick={showSearchMenu}
          className="w-full h-full absolute"
          style={{ backdropFilter: "blur(10px)" }}
        ></div>
        <div
          className={`relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg ${
            isMobile ? " w-3/4 p-3" : "w-2/3 lg:w-1/2 p-3 lg:p-5"
          }`}
        >
          <div className={`flex w-full ${isMobile ? "gap-3" : "gap-5"}`}>
            {/* let you type in the search bar after the event */}
            <TextField
              fullWidth
              label="Type to search ..."
              onChange={(event) => setsearchbook(event.target.value)}
              value={searchbook != null ? searchbook : transcript}
            />
            {
              //add something to show browser doesn't support that
              !browserSupportsSpeechRecognition ? (
                <button>
                  <Help />
                </button>
              ) : listening ? (
                <Button onClick={SpeechRecognition.stopListening}>
                  <MicNoneIcon />{" "}
                </Button>
              ) : (
                <Button onClick={SpeechRecognition.startListening}>
                  <KeyboardVoiceIcon />
                </Button>
              )
            }
          </div>
          <div className="h-[400px] overflow-y-scroll">
            <TransitionGroup className="book-listgrid grid-cols-1 gap-2 mt-4">
              {Books.map((book) => (
                <CSSTransition key={book.id} timeout={500} classNames="book">
                  <li className=" flex list-none mx-auto book-item relative transition-transform delay-150 ease-linear">
                    <a
                      href={`/books/${book.id}`}
                      key={book.id}
                      className="flex w-full items-center p-4 rounded-lg shadow-md"
                    >
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-16 h-16 rounded-md shadow-md mr-4"
                      />
                      <div>
                        <h2 className="text-lg font-medium">{book.title}</h2>
                        <h3 className="text-gray-500">{book.author}</h3>
                      </div>
                    </a>
                  </li>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </div>
        </div>
      </div>
      <React.Fragment>
        <AppBar
          elevation={
            pathname.includes("books") || pathname.includes("genres") ? 0 : 4
          }
          sx={{ background: "#fff", position: "fixed", zIndex: "998" }}
        >
          <Toolbar>
            <Box
              sx={{
                display: "flex",
                position: "relative",
                alignItems: "center",
                width: "fit-content",
                borderRadius: 1,
                bgcolor: "background.paper",
                color: "text.secondary",
                "& svg": {
                  m: 1.5,
                },
                "& hr": {
                  mx: 0.5,
                },
              }}
            >
              <div className="flex w-full justify-between">
                <Typography sx={{ paddingRight: "10px" }}>
                  <a href="/">
                    <img src={librant} className=" w-16 h-16" alt="" />
                  </a>
                </Typography>
              </div>

              {isMobile ? (
                <></>
              ) : (
                <div className="flex">
                  <Divider
                    sx={{ height: "50px", top: "0px", position: "relative" }}
                    orientation="vertical"
                    flexItem
                  />
                  <Button>
                    <Link to="/" style={{ textDecoration: "none" }}>
                      <span className="font-bold text-gray-800">
                        {t("home")}
                      </span>
                    </Link>
                  </Button>
                  <Button>
                    <Link to="/books" style={{ textDecoration: "none" }}>
                      <span className="font-bold text-gray-800">
                        {t("book")}
                      </span>
                    </Link>
                  </Button>
                  <Button
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                  >
                    <span className="font-bold text-gray-800">
                      {t("category")}
                    </span>
                  </Button>
                  <Button
                    id="basic-button"
                    aria-controls={open2 ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open2 ? "true" : undefined}
                    onClick={handleClickLang}
                  >
                    <span className="font-bold text-gray-800">{t("lang")}</span>
                  </Button>
                  <Button>
                    <Link to="/search" style={{ textDecoration: "none" }}>
                      <span className="font-bold text-gray-800">
                        {t("support")}
                      </span>
                    </Link>
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        "&:before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          left: 13,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "left", vertical: "top" }}
                    anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                  >
                    {categories ? (
                      categories.length > 0 ? (
                        <div className="p-2">
                          <p className="py-2 px-4 font-bold">Categories</p>
                          <hr />
                          {categories.map((category) => (
                            <MenuItem
                              key={category}
                              onClick={(e) =>
                                handelCatChange({ e: e, category: category })
                              }
                            >
                              {category}
                            </MenuItem>
                          ))}
                        </div>
                      ) : (
                        <MenuItem>No categories</MenuItem>
                      )
                    ) : (
                      <></>
                    )}
                  </Menu>

                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEllang}
                    open={open2}
                    onClose={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        "&:before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          left: 24,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem onClick={() => changeLanguage({ lang: "fr" })}>
                      Français
                    </MenuItem>
                    <MenuItem onClick={() => changeLanguage({ lang: "en" })}>
                      English
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </Box>
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{
                display: "flex",
                alignItems: "center",
                marginLeft: "auto",
                width: "fit-content",
                borderRadius: 1,
                bgcolor: "background.paper",
                color: "text.secondary",
                "& svg": {
                  m: 1.5,
                },
                "& hr": {
                  mx: 0.5,
                },
                "& .MuiTextField-root": { m: 1, width: "25ch" },
              }}
            >
              {isMobile ? (
                <DrawerComponent setsearch={setsearch} />
              ) : (
                <div>
                  {pathname.includes("books") ? (
                    <></>
                  ) : (
                    <Button
                      id="myButton"
                      onClick={showSearchMenu}
                      sx={{
                        height: "50px",
                        background: "#EAEBED",
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: "#F8F8F8",
                          color: "#F8F8F8",
                          boxShadow: "none",
                        },
                      }}
                      variant="contained"
                    >
                      <span className="font-bold text-gray-700">
                        {t("click_to_search")} ...{" "}
                        <span className="bg-gray-50 p-2 rounded-sm">
                          ctrl+m
                        </span>
                      </span>
                    </Button>
                  )}

                  {user ? (
                    <>
                      <Tooltip title="Account settings">
                        <IconButton
                          onClick={handleClickUser}
                          size="small"
                          sx={{ ml: 2 }}
                          aria-controls={open1 ? "account-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={open1 ? "true" : undefined}
                        >
                          {user.imageUrl != "-" ? (
                            <Avatar
                              src={user.imageUrl}
                              sx={{ width: 32, height: 32 }}
                            />
                          ) : (
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: randomColor(
                                  user.fullname.charAt(0).toUpperCase()
                                ),
                              }}
                            >
                              {user.fullname.charAt(0).toUpperCase()}
                            </Avatar>
                          )}
                        </IconButton>
                      </Tooltip>
                      <Menu
                        id="user-menu"
                        anchorEl={anchorEl2}
                        open={open1}
                        onClose={handleClose}
                        PaperProps={{
                          elevation: 0,
                          sx: {
                            overflow: "visible",
                            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                            mt: 1.5,
                            "& .MuiAvatar-root": {
                              width: 32,
                              height: 32,
                              ml: -0.5,
                              mr: 1,
                            },
                            "&:before": {
                              content: '""',
                              display: "block",
                              position: "absolute",
                              top: 0,
                              right: 14,
                              width: 10,
                              height: 10,
                              bgcolor: "background.paper",
                              transform: "translateY(-50%) rotate(45deg)",
                              zIndex: 0,
                            },
                          },
                        }}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}
                      >
                        {user.role === "admin" ? (
                          <>
                            <MenuItem onClick={handleClose}>
                              <Link
                                to="/dashboard"
                                style={{ textDecoration: "none" }}
                              >
                                <ListItemIcon>
                                  <Dashboard fontSize="small" />
                                </ListItemIcon>
                                {t("dashboard")}
                              </Link>
                            </MenuItem>
                          </>
                        ) : (
                          <>
                            <MenuItem onClick={handleClose}>
                              <Link to="/profile" className="flex">
                                <Avatar
                                  src={user.imageUrl}
                                  sx={{ width: 32, height: 32 }}
                                />{" "}
                                <p className="my-auto">{user.fullname}</p>
                              </Link>
                            </MenuItem>
                          </>
                        )}
                        <Divider />
                        <MenuItem onClick={handleClose}>
                          <Link to="/profile/settings" className="flex">
                            <ListItemIcon>
                              <Settings fontSize="small" />
                            </ListItemIcon>
                            {t("settings")}
                          </Link>
                        </MenuItem>
                        <MenuItem onClick={handleSignOut}>
                          <ListItemIcon>
                            <Logout fontSize="small" />
                          </ListItemIcon>
                          {t("logout")}
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <>
                      <Button
                        sx={{ marginLeft: "10px", height: "50px" }}
                        variant="contained"
                      >
                        <Link to="/login" style={{ textDecoration: "none" }}>
                          <span className="font-bold uppercase">
                            {t("login")}
                          </span>
                        </Link>
                      </Button>
                      <Button
                        sx={{ marginLeft: "10px", height: "50px" }}
                        variant="outlined"
                      >
                        <Link to="/register" style={{ textDecoration: "none" }}>
                          <span className="font-bold uppercase">
                            {t("register")}
                          </span>
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </React.Fragment>
    </>
  );
};

export default NavBar;
