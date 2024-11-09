import { useEntities } from "@daveyplate/supabase-swr-entities/client"
import Peer, { DataConnection } from "peerjs"
import { useEffect, useRef, useState } from "react"

/**
 * Peer Connections hook
 * @param {Object} props - The hook props
 * @param {boolean} [props.enabled=false] - Is the hook enabled
 * @param {(data: any, connection: DataConnection) => void} [props.onData=null] - The data handler
 * @param {string} [props.room=null] - The room to connect to
 * @returns {{ peers: any[], sendData: (data: any) => void, connections: DataConnection[], isOnline: (userId: string) => boolean, getPeer: (connection: DataConnection) => any, getConnection: (userId: string) => DataConnection}} The hook result
 */
export const usePeers = ({ enabled = false, onData = null, room = null }) => {
    const {
        entities: peers,
        createEntity: createPeer,
        updateEntity: updatePeer,
        deleteEntity: deletePeer,
        mutateEntities: mutatePeers,
    } = useEntities(enabled && 'peers', { room })

    const [peer, setPeer] = useState(null)
    const [connections, setConnections] = useState([])
    const connectionsRef = useRef([])
    const connectionAttempts = useRef([])

    /**
     * Prepare connection handlers
     * @param {DataConnection} connection - The connection
     * @param {boolean} [inbound=false] - Is the connection inbound
     */
    const handleConnection = (connection, inbound = false) => {
        connection?.removeAllListeners()

        onData && connection?.on("data", (data) => {
            onData(data, connection)
        })

        connection?.on("open", () => {
            console.log("connection opened")
            connectionsRef.current = connectionsRef.current.filter((conn) => conn.peer != connection.peer)
            connectionsRef.current.push(connection)
            connectionAttempts.current = connectionAttempts.current.filter((id) => id != connection.peer)
            setConnections(connectionsRef.current)

            if (inbound) {
                mutatePeers()
            }
        })

        connection?.on('close', () => {
            console.log("connection closed")
            connectionsRef.current = connectionsRef.current.filter((conn) => conn.peer != connection.peer)
            connectionAttempts.current = connectionAttempts.current.filter((id) => id != connection.peer)
            setConnections(connectionsRef.current)
        })

        connection?.on('error', (error) => {
            console.error("connection error", error)
            connectionsRef.current = connectionsRef.current.filter((conn) => conn.peer != connection.peer)
            connectionAttempts.current = connectionAttempts.current.filter((id) => id != connection.peer)
            setConnections(connectionsRef.current)
        })
    }

    // Clean up the peer on unmount
    useEffect(() => {
        if (!enabled) return

        const deletePeerOnUnload = () => {
            connectionsRef.current.forEach((conn) => conn.close())
            setConnections([])
            connectionsRef.current = []
            connectionAttempts.current = []
            peer?.id && deletePeer(peer.id)
            peer?.destroy()
        }

        window.addEventListener("beforeunload", deletePeerOnUnload)

        return () => {
            deletePeerOnUnload()
            window.removeEventListener("beforeunload", deletePeerOnUnload)
        }
    }, [peer])

    useEffect(() => {
        if (!enabled) return

        setTimeout(() => {
            connectionAttempts.current = []
        }, 10000)
    }, [peers])

    useEffect(() => {
        if (!peer?.id || !peers || !enabled) return

        const keepPeerCurrent = () => {
            const currentPeer = peers.find((p) => p.id == peer.id)
            if (currentPeer) {
                updatePeer(currentPeer, { updated_at: new Date() })
            } else {
                createPeer({ id: peer.id, room })
            }
        }

        const interval = setInterval(keepPeerCurrent, 60000)

        if (!peers.find(p => p.id == peer.id)) {
            console.log("Create a Peer Entity")
            createPeer({ id: peer.id, room })
        }

        const inboundConnection = (conn) => {
            handleConnection(conn, true)
        }

        peer.on("connection", inboundConnection)

        peers.forEach(p => {
            if (p.id == peer.id) return
            if (connectionsRef.current.some((c) => c.peer == p.id)) return
            if (connectionAttempts.current.includes(p.id)) return

            console.log("connection attempt", p.id)
            connectionAttempts.current.push(p.id)
            const conn = peer.connect(p.id)
            handleConnection(conn)
        })

        connectionsRef.current.forEach((conn) => {
            handleConnection(conn)
        })

        return () => {
            clearInterval(interval)
            peer.off("connection", inboundConnection)
        }
    }, [peers, peer, connections, onData])


    useEffect(() => {
        if (!enabled) return

        // Create a new Peer instance
        const newPeer = new Peer()
        newPeer.on('open', (id) => {
            console.log('Peer ID: ' + id)
            setPeer(newPeer)
        })

        // newPeer.on('error', console.error)

        return () => {
            newPeer.destroy()
        }
    }, [enabled])

    /**
     * Send data to all connections
     * @param {any} data - The data to send
     */
    const sendData = (data) => {
        connectionsRef.current.forEach((conn) => conn.send(data))
    }

    /** 
     * Check if a user is online
     * @param {string} userId - The user ID
     * @returns {boolean} Is the user online
     */
    const isOnline = (userId) => {
        return !!getConnection(userId)
    }

    /**
     * Get the peer for a connection
     * @param {DataConnection} connection - The connection
     * @returns {any} The peer
     */
    const getPeer = (connection) => {
        return peers.find((peer) => peer.id == connection?.peer)
    }

    /**
     * Get the connection for a user
     * @param {string} userId - The user ID
     * @returns {DataConnection} The connection
     */
    const getConnection = (userId) => {
        const connection = connections.find((connection) => {
            const connectionPeer = peers.find((peer) => peer.id == connection.peer)
            return connectionPeer?.user_id == userId
        })

        return connection
    }

    return { peers, sendData, connections, isOnline, getPeer, getConnection }
}