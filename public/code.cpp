#include <iostream>

int counter = 0;

struct Alpha {
    Alpha() { counter += 1; }
    Alpha(const Alpha& a) { counter += 2; }
    virtual void func() { counter += 3; }
    virtual ~Alpha() { counter += 4; }
};

struct Beta : Alpha {
    Beta() { counter += 5; }
    Beta(const Beta& b) : Alpha(b) { counter += 6; }
    void func() override { counter += 7; }
    ~Beta() { counter += 8; }
};

void run_process(Alpha a, Alpha* ptr) {
    a.func();
    ptr->func();
}

int main() {
    {
        Beta b;
        run_process(b, &b);
    }
    std::cout << counter << std::endl;
    return 0;
}