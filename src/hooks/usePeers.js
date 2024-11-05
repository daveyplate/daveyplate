import { useEntities } from "@daveyplate/supabase-swr-entities/client"
import Peer from "peerjs"
import { useEffect, useRef, useState } from "react"
import { v4 } from "uuid"

export const usePeers = ({ enabled = false, onMessage = null }) => {
    const { entities: peers, createEntity: createPeer, updateEntity: updatePeer, deleteEntity: deletePeer, isLoading: peersLoading } = useEntities(enabled && 'peers')
    const peerId = useRef(null)
    const [peer, setPeer] = useState(null)
    const [connections, setConnections] = useState([])

    const handleConnection = (conn) => {
        if (!conn) return

        conn.on("data", (data) => {
            // Will print 'hi!'
            console.log(data);
            onMessage && onMessage(data)
        })

        conn.on("open", () => {
            console.log('Connection opened')
            setConnections([...connections, conn])
            conn.send("hello!")
        })

        conn.on('close', () => {
            setConnections(connections.filter(c => c.peer !== conn.peer))
            console.log('Connection closed')
        })
    }

    useEffect(() => {
        if (!enabled) return
        if (!peers && peersLoading) return
        if (!peerId.current) {
            peerId.current = v4()
        }

        // Create a new Peer instance
        const newPeer = new Peer(peerId.current)
        newPeer.on('open', function (id) {
            console.log('My peer ID is: ' + id)
            if (peers.some(p => p.id === id)) return

            createPeer({ id })
            setPeer(newPeer)
        })

        // newPeer.on('error', console.error)

        newPeer.on("connection", handleConnection)

        // Clean up the peer instance on component unmount
        return () => {
            setConnections([])
            setPeer(null)
            deletePeer(newPeer.id)
            newPeer.destroy()
        }
    }, [enabled, peersLoading])

    useEffect(() => {
        if (!peer) return
        console.log('peers', peers)

        peers?.forEach(p => {
            if (p.id == peer.id) return
            if (connections.some(c => c.peer == p.id)) return

            console.log("attempt to connect to", p.id)
            const conn = peer.connect(p.id)
            handleConnection(conn)
        })
    }, [peers, peer])

    const send = (data) => {
        connections.forEach(c => c.send(data))
    }

    return { peers, send }
}