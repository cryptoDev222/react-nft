import React from 'react'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Female from '../assets/female-sign.png';
import Male from '../assets/male-gender.png';
import Baby from '../assets/baby.png';
import Flag from '../assets/flag.png';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const Stake = () => {
  const useStyles = makeStyles(theme => ({
    root: {
      height: '294px',
      borderRadius: '12px',
      background: '#f1f1f1',
      position: 'relative',
      padding: '24px 18px',
    },
    icon: {
      margin: theme.spacing(1),
      width: '48px',
      height: '48px',
      padding: '4px',
      borderRadius: '10px',
      backgroundColor: 'white',
    },
    inputField: {
      flexGrow: 1,
      backgroundColor: 'white',
      marginLeft: '16px',
      marginRight: '48px',
      height: theme.spacing(4),
      borderRadius: '14px',
      height: '42px'
    },
    button: {
      margin: theme.spacing(1),
      width: '100%',
      height: '48px',
      borderRadius: '14px',
      fontSize: '18px',
      fontWeight: 600,
    }
  }));

  const classes = useStyles();

  return (
    <Grid container className = {classes.root}>
      <Grid item xs={8} container direction="column" justify="space-between" alignItems="flex-start" spacing={1}>
        <Grid container direction="row" alignItems="center">
          <Grid className={classes.icon} container justify="center" alignItems="center">
            <img width="60%" height="auto" src={Female} alt="avatar"/>
          </Grid>
          <Grid className={classes.inputField} >&nbsp;</Grid>
        </Grid>
        <Grid container direction="row" alignItems="center">
          <Grid className={classes.icon} container justify="center" alignItems="center">
            <img width="60%" height="auto" src={Male} alt="avatar"/>
          </Grid>
          <Grid className={classes.inputField} />
        </Grid>
        <Grid container direction="row" alignItems="center">
          <Grid className={classes.icon} container justify="center" alignItems="center">
            <img width="60%" height="auto" src={Baby} alt="avatar"/>
          </Grid>
          <Grid className={classes.inputField} />
        </Grid>
        <Grid container direction="row" alignItems="center">
          <Grid className={classes.icon} container justify="center" alignItems="center">
            <img width="60%" height="auto" src={Flag} alt="avatar"/>
          </Grid>
          <Grid className={classes.inputField} />
        </Grid>
      </Grid>
      <Grid item xs={4} container alignItems="flex-end" justify="center">
        <Button variant="contained" color="primary" className={classes.button}>
          STAKE
        </Button>
      </Grid>
    </Grid>
  )
}

export default Stake