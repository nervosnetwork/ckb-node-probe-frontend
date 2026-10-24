"use client";
import { Data } from "@/interface/page";
import { renderMapGraph, renderMapWithMarker } from "./util";
import React, { useState, useEffect } from "react";
import styles from './index.module.scss';
import Quote from "@/app/components/Quote/Quote";
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation';
import {Skeleton} from "antd";
import Image from "next/image";
interface MapProps {
  data: Data[]
}

declare global {
    interface Window {
        _map: any;
    }
}

const Map: React.FC<MapProps> = ({ data }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [inputValue, setInputValue] = useState<string>('');
    const [isNodeRunning, setIsNodeRunning] = useState<boolean>(false);
    const [nodeId, setNodeId] = useState<string>('');
    const [errorType, setErrorType] = useState<number>(-1)
    const [checkStatus, setCheckStatus] = useState<boolean>(false)
    const [pendingStatus, setPendingStatus] = useState<boolean>(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const copyNodeIdToClipboard = () => {
        navigator.clipboard.writeText(nodeId)
            .catch(err => {
                // 处理复制失败的情况
                console.error('Failed to copy NodeId:', err);
            });
    };

    const handleButtonClick = () => {
        setPendingStatus(true)
        fetch("http://127.0.0.1:8114", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: '{"id":0,"jsonrpc":"2.0","method":"local_node_info","params":[]}'
        })
            .then(response => response.json())
            .then(response => {
                if (response && response.result && response.result.node_id) {
                    setNodeId(response.result.node_id);
                    setIsNodeRunning(true);
                    setCheckStatus(true)
                    setErrorType(2)
                    setInputValue(response.result.node_id)
                    setPendingStatus(false)
                } else {
                    setErrorType(3)
                }
            })
            .catch(error => {
                setPendingStatus(false)
                console.error('Error fetching node info:', error);
                setErrorType(3)
            });
    };

    const getInMap = async(nodeId?: string) => {
        setPendingStatus(true)
        const searchNodeId = nodeId || inputValue;
        const url = location.hostname === 'localhost' ? 'nodes-dev.ckbapp.dev' : 'nodes.ckb.dev';
        const response = await fetch(`//api-${url}/peer_status?peer_id=${searchNodeId}`, {
            cache: 'no-cache'  // Prevent caching issues
        });
        const nodeInMap = await response.json()
        setPendingStatus(false)
        console.log('API Response:', nodeInMap); // Debug log
        if(nodeInMap && nodeInMap['in_map']) {
            // Clear any previous "node not visible" notification.
            setErrorType(-1);
            // Mark the node on the map
            if (nodeInMap.info && nodeInMap.info.latitude && nodeInMap.info.longitude) {
                const nodeInfo = {
                    ...nodeInMap.info,
                    id: nodeInMap.peer_id
                };
                // Update URL with search params
                const params = new URLSearchParams(searchParams?.toString() || '');
                params.set('nodeId', nodeInMap.peer_id);
                window.history.pushState(null, '', `?${params.toString()}`);
                
                renderMapWithMarker(nodeInfo, () => {
                    // Clear search params when popup is closed
                    window.history.pushState(null, '', window.location.pathname);
                    // Clear input value
                    setInputValue('');
                });
            }
        } else {
            setErrorType(1)
        }
    }

    const renderPopup = () => {
        switch (errorType) {
            case 0:
                return (
                    <div className={styles.popup}>
                        <Image width={20} height={26} src={'/lightOpen.svg'} alt={'light-open'} />
                        <span>&nbsp;<br />Your node is connectable and visible on the network！<br /> Map location is approximated based on IP address :) <br /> &nbsp;
                        </span>
                        <Image width={18} height={18} src={'/close.svg'} alt={'light-open'} onClick={() => {
                            setErrorType(-1);
                            // Clear search params when closing popup
                            window.history.pushState(null, '', window.location.pathname);
                        }}/>
                    </div>
                );
            case 1:
                return (
                    <div className={styles.popup}>
                        <Image width={20} height={26} src={'/lightClose.svg'} alt={'light-close'} />
                        <span>Your node isn&apos;t currently visible,<Link href="/getConnectedInstruction">let&apos;s connect!</Link></span>
                        <Image width={18} height={18} src={'/close.svg'} alt={'light-open'} onClick={() => {
                            setErrorType(-1);
                            // Clear search params when closing popup
                            window.history.pushState(null, '', window.location.pathname);
                        }}/>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.popup}>
                        <div className={styles.nodeIdInfo}>
                            <span>Node ID: <span>{nodeId}</span></span>
                            <Image width={20} height={26} src={'/copy.svg'} alt={'light-open'} onClick={() => copyNodeIdToClipboard()} />
                        </div>
                        <Image width={18} height={18} src={'/close.svg'} alt={'light-open'} onClick={() => {
                            setErrorType(-1);
                            // Clear search params when closing popup
                            window.history.pushState(null, '', window.location.pathname);
                        }}/>
                    </div>
                );
            case 3:
                return (
                    <div className={styles.popup}>
                        <div className={styles.noNodeIdErrorInfo}>
                            <div>
                                Make sure your node is running and try again.
                            </div>
                            <div className={styles.Mt10}>
                                If the issue persists, <Link href="/findNode"> Check out other ways to find your Node ID.</Link>
                            </div>
                        </div>
                        <Image width={18} height={18} src={'/close.svg'} alt={'light-open'} onClick={() => {
                            setErrorType(-1);
                            // Clear search params when closing popup
                            window.history.pushState(null, '', window.location.pathname);
                        }}/>
                    </div>
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        // Check if nodeId is in search params and load that node
        const nodeIdFromUrl = searchParams?.get('nodeId');
        if (nodeIdFromUrl && data.length > 0) {
            setInputValue(nodeIdFromUrl);
            // Trigger search for the node
            setTimeout(() => {
                getInMap(nodeIdFromUrl);
            }, 1000); // Small delay to ensure map is loaded
        }
    }, [searchParams, data]);

    useEffect(() => {
        renderMapGraph(data);
        setLoading(false);
        return () => {
            if (window._map) {
                window._map.remove();
                window._map = null;
            }
        }
    }, [data]);


  return (
    <>
        <div className={styles.mapGraphCt}>
            <div id="mapGraph"  className={styles.mapGraph}>{renderPopup()}</div>
            
            <div className={styles.searchNodeContainer}>
                <div
                    className={styles.inputSearchNodeID}
                >
                    <div onClick={() => getInMap()}>
                        <Image src={'/search.svg'} alt={'search'} width={44} height={44} />
                    </div>
                    <input
                        placeholder={'enter Node ID to check visibility'}
                        value={inputValue}
                        type='text'
                        onChange={handleInputChange}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                getInMap();
                            }
                        }}
                    />
                </div>
                <div
                    onClick={handleButtonClick}
                    className={styles.searchButton}
                >
                    Get My Node ID
                </div>
            </div>
        </div>
      <Quote />
    </>
  )
}

export default Map;
