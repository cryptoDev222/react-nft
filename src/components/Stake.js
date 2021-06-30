import React from "react";
import Select from "react-select";
import { Grid, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import Female from "../assets/female-sign.png";
import Male from "../assets/male-gender.png";
import Baby from "../assets/baby.png";
import Button from "@material-ui/core/Button";
import MyContext from "../lib/context";

const Stake = () => {
  const stake = React.useContext(MyContext).stake;
  const withdraw = React.useContext(MyContext).withdraw;
  const state = React.useContext(MyContext).state;

  const femaleEl = React.useRef(null);

  const useStyles = makeStyles((theme) => ({
    root: {
      borderRadius: "12px",
      background: "#f1f1f1",
      position: "relative",
      padding: theme.spacing(3),
    },
    icon: {
      margin: theme.spacing(1),
      width: "48px",
      height: "48px",
      padding: "4px",
      borderRadius: "10px",
      backgroundColor: "white",
    },
    inputField: {
      flexGrow: 1,
      backgroundColor: "white",
      margin: "0px 16px",
      borderRadius: "14px",
      height: "42px",
      "& select": {
        width: "calc(100% - 16px)",
        height: "100%",
        border: "none",
        outline: "none",
        background: "none",
        marginLeft: "8px",
        fontFamily: '"Poppins"',
      },
    },
    selectElem: {
      width: "calc(100% - 96px)",
      backgroundColor: "white",
      margin: "0px 16px",
      borderRadius: "14px",
      minHeight: "42px",
      border: "none",
      outline: "none",
      "&>div.css-yk16xz-control": {
        height: "42px",
        border: "none",
        borderRadius: "14px",
        outline: "none",
      },
      "&>div.css-1pahdxg-control": {
        height: "42px",
        border: "none",
        borderRadius: "14px",
        outline: "none",
      },
      "& .css-g1d714-ValueContainer": {
        display: "inline-flex",
        flexWrap: "nowrap",
      },
    },
    button: {
      margin: "16px 16px 8px 8px",
      borderRadius: "14px",
      fontSize: "18px",
      width: "fit-content",
      fontWeight: 600,
    },
  }));

  const classes = useStyles();

  let stakedIds = [];
  state.staked.forEach((data) => {
    stakedIds.push(data.token_id);
  });

  let femaleData = [];

  state.femaleId.forEach((data) => {
    if (stakedIds.indexOf(data.token_id) !== -1) return;
    femaleData.push({
      label:
        data.name !== "null" && data.name !== null && data.name !== ""
          ? data.name
          : "NFA #" + data["token_id"],
      value: data["token_id"],
    });
  });

  let maleData = [];

  state.maleId.forEach((data) => {
    if (stakedIds.indexOf(data.token_id) !== -1) return;
    maleData.push({
      label:
        data.name !== "null" && data.name !== null && data.name !== ""
          ? data.name
          : "NFA #" + data["token_id"],
      value: data["token_id"],
    });
  });

  let babyData = [];

  state.babyId.forEach((data) => {
    if (stakedIds.indexOf(data.token_id) !== -1) return;
    babyData.push({
      label:
        data.name !== "null" && data.name !== null && data.name !== ""
          ? data.name
          : "NFA #" + data["token_id"],
      value: data["token_id"],
    });
  });

  const [value, setValue] = React.useState([]);

  const [valueM, setValueM] = React.useState([]);

  const [valueB, setValueB] = React.useState([]);

  const handleChange = (e) => {
    setValue(e);
  };

  const handleChangeM = (e) => {
    setValueM(e);
  };

  const handleChangeB = (e) => {
    setValueB(e);
  };

  const reset = () => {
    femaleEl.current.select.clearValue();
    setValueM([]);
    setValueB([]);
    setValue([]);
  };

  return (
    <Grid container className={classes.root}>
      <Grid
        item
        xs={12}
        md={12}
        container
        direction="column"
        justify="space-between"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid container direction="row" alignItems="center">
          <Grid
            className={classes.icon}
            container
            justify="center"
            alignItems="center"
          >
            <img width="60%" height="auto" src={Female} alt="avatar" />
          </Grid>
          <Select
            ref={femaleEl}
            className={classes.selectElem}
            options={femaleData}
            onChange={handleChange}
            isMulti
          />
        </Grid>
        <Grid container direction="row" alignItems="center">
          <Grid
            className={classes.icon}
            container
            justify="center"
            alignItems="center"
          >
            <img width="60%" height="auto" src={Male} alt="avatar" />
          </Grid>
          <Select
            value={valueM}
            className={classes.selectElem}
            options={maleData}
            onChange={handleChangeM}
            isMulti
          />
        </Grid>
        <Grid container direction="row" alignItems="center">
          <Grid
            className={classes.icon}
            container
            justify="center"
            alignItems="center"
          >
            <img width="60%" height="auto" src={Baby} alt="avatar" />
          </Grid>
          <Select
            value={valueB}
            className={classes.selectElem}
            options={babyData}
            onChange={handleChangeB}
            isMulti
          />
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        md={12}
        container
        alignItems="flex-end"
        justify="center"
      >
        <Button
          onClick={() => {
            stake(value, valueM, valueB, reset);
          }}
          variant="contained"
          color="primary"
          disabled={state.isStaking}
          className={classes.button}
        >
          {state.isStaking ? (
            <CircularProgress
              color="primary"
              style={{ width: "32px", height: "32px" }}
            />
          ) : (
            "STAKE"
          )}
        </Button>
        <Button
          onClick={() => {
            withdraw();
          }}
          variant="contained"
          color="primary"
          disabled={state.isWithdraw}
          className={classes.button}
        >
          {state.isWithdraw ? (
            <CircularProgress
              color="primary"
              style={{ width: "32px", height: "32px" }}
            />
          ) : (
            "WITHDRAW"
          )}
        </Button>
      </Grid>
    </Grid>
  );
};

export default Stake;
