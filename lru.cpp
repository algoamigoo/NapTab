#include <unordered_map>
#include <vector>
#include <emscripten.h>

class LRUCache
{
private:
    struct Node
    {
        int tabId;
        Node *prev;
        Node *next;
        Node(int id) : tabId(id), prev(nullptr), next(nullptr) {}
    };
    std::unordered_map<int, Node *> map;
    Node *head;
    Node *tail;
    int capacity;
    int size;

    void moveToFront(Node *node)
    {
        removeNode(node);
        addToFront(node);
    }

    void removeNode(Node *node)
    {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void addToFront(Node *node)
    {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }

public:
    LRUCache(int cap) : capacity(cap), size(0)
    {
        head = new Node(-1); // Dummy head
        tail = new Node(-1); // Dummy tail
        head->next = tail;
        tail->prev = head;
    }

    ~LRUCache()
    {
        Node *current = head->next;
        while (current != tail)
        {
            Node *next = current->next;
            delete current;
            current = next;
        }
        delete head;
        delete tail;
    }

    int use(int tabId)
    {
        auto it = map.find(tabId);
        if (it != map.end())
        {
            moveToFront(it->second);
            return -1;
        }
        else
        {
            Node *newNode = new Node(tabId);
            addToFront(newNode);
            map[tabId] = newNode;
            size++;
            if (size > capacity)
            {
                Node *toEvict = tail->prev;
                int evictedId = toEvict->tabId;
                removeNode(toEvict);
                map.erase(evictedId);
                delete toEvict;
                size--;
                return evictedId;
            }
            return -1;
        }
    }

    void remove(int tabId)
    {
        auto it = map.find(tabId);
        if (it != map.end())
        {
            Node *node = it->second;
            removeNode(node);
            map.erase(tabId);
            delete node;
            size--;
        }
    }

    std::vector<int> getActiveTabs()
    {
        std::vector<int> tabs;
        Node *current = head->next;
        while (current != tail)
        {
            tabs.push_back(current->tabId);
            current = current->next;
        }
        return tabs;
    }

    bool isInCache(int tabId)
    {
        return map.find(tabId) != map.end();
    }
};

extern "C"
{
    LRUCache *cache = nullptr;

    EMSCRIPTEN_KEEPALIVE
    void initCache(int capacity)
    {
        if (cache)
            delete cache;
        cache = new LRUCache(capacity);
    }

    EMSCRIPTEN_KEEPALIVE
    int useTab(int tabId)
    {
        if (cache)
            return cache->use(tabId);
        return -1;
    }

    EMSCRIPTEN_KEEPALIVE
    void removeTab(int tabId)
    {
        if (cache)
            cache->remove(tabId);
    }

    EMSCRIPTEN_KEEPALIVE
    int getActiveTabsCount()
    {
        if (cache)
            return cache->getActiveTabs().size();
        return 0;
    }

    EMSCRIPTEN_KEEPALIVE
    void getActiveTabs(int *buffer)
    {
        if (cache)
        {
            auto tabs = cache->getActiveTabs();
            for (size_t i = 0; i < tabs.size(); i++)
            {
                buffer[i] = tabs[i];
            }
        }
    }

    EMSCRIPTEN_KEEPALIVE
    bool isTabInCache(int tabId)
    {
        if (cache)
            return cache->isInCache(tabId);
        return false;
    }
}
