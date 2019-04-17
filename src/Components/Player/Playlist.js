/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import classNames from 'classnames';
import { getMedia, openMedia } from '../../Utils/Message';
import { borderStyle } from '../Theme';
import { withStyles } from '@material-ui/core';
import PlayerStore from '../../Stores/PlayerStore';
import './Playlist.css';

const styles = theme => ({
    root: {
        background: theme.palette.type === 'dark' ? theme.palette.background.default : '#FFFFFF'
    },
    ...borderStyle(theme)
});

class Playlist extends React.Component {
    constructor(props) {
        super(props);

        const { message, playlist } = PlayerStore;

        this.chatId = message ? message.chat_id : 0;
        this.messageId = message ? message.id : 0;

        this.state = {
            open: false,
            titleMouseOver: false,
            playlistMouseOver: false,
            playlist: playlist
        };
    }

    componentDidMount() {
        PlayerStore.on('clientUpdateMediaActive', this.onClientUpdateMediaActive);
        PlayerStore.on('clientUpdateMediaPlaylist', this.onClientUpdateMediaPlaylist);
        PlayerStore.on('clientUpdateMediaPlaylistLoading', this.onClientUpdateMediaPlaylistLoading);
        PlayerStore.on('clientUpdateMediaTitleMouseOver', this.onClientUpdateMediaTitleMouseOver);
    }

    componentWillUnmount() {
        PlayerStore.removeListener('clientUpdateMediaActive', this.onClientUpdateMediaActive);
        PlayerStore.removeListener('clientUpdateMediaPlaylist', this.onClientUpdateMediaPlaylist);
        PlayerStore.removeListener('clientUpdateMediaPlaylistLoading', this.onClientUpdateMediaPlaylistLoading);
        PlayerStore.removeListener('clientUpdateMediaTitleMouseOver', this.onClientUpdateMediaTitleMouseOver);
    }

    onClientUpdateMediaTitleMouseOver = update => {
        const { over } = update;

        if (over) {
            this.setState(
                {
                    playlistMouseOver: over
                },
                () => {
                    this.tryOpen();
                }
            );
        } else {
            this.setState(
                {
                    playlistMouseOver: over
                },
                () => {
                    this.tryClose();
                }
            );
        }
    };

    onClientUpdateMediaActive = update => {
        const { chatId, messageId } = update;

        this.chatId = chatId;
        this.messageId = messageId;
    };

    onClientUpdateMediaPlaylistLoading = update => {
        const { chatId, messageId } = this;

        if (update.chatId === chatId && update.messageId === messageId) {
            this.setState({
                playlist: null
            });
        }
    };

    onClientUpdateMediaPlaylist = update => {
        const { chatId, messageId } = this;
        const { playlist } = update;

        if (chatId === playlist.chatId && messageId === playlist.messageId) {
            this.setState({
                playlist: playlist
            });
        }
    };

    tryOpen = () => {
        clearTimeout(this.openTimeout);

        this.openTimeout = setTimeout(() => {
            const { titleMouseOver, playlistMouseOver } = this.state;
            this.setState({
                open: titleMouseOver || playlistMouseOver
            });
        }, 250);
    };

    tryClose = () => {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            const { titleMouseOver, playlistMouseOver } = this.state;
            this.setState({
                open: titleMouseOver || playlistMouseOver
            });
        }, 250);
    };

    handleMouseEnter = () => {
        this.setState({
            playlistMouseOver: true,
            open: true
        });
    };

    handleMouseLeave = () => {
        this.setState(
            {
                playlistMouseOver: false
            },
            () => {
                this.tryClose();
            }
        );
    };

    render() {
        const { classes } = this.props;

        const { open, playlist } = this.state;
        if (!open) return null;
        if (!playlist) return null;

        const { messages } = playlist;
        if (!messages) return null;
        if (messages.length <= 1) return null;

        return (
            <div className='playlist'>
                <div
                    className={classNames('playlist-items', classes.root, classes.borderColor)}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}>
                    {playlist.messages.map(x => (
                        <div className='playlist-item'>{getMedia(x, () => openMedia(x.chat_id, x.id))}</div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Playlist);
